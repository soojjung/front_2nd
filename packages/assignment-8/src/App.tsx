import { useRef, useState } from "react";
import { Box, Flex, useInterval, useToast } from "@chakra-ui/react";

import { Event } from "./types";
import { findOverlappingEvents } from "./utils/eventUtils";
import { validateTime } from "./utils/validationTools.ts";

import EventAddOrUpdate from "./components/EventAddOrUpdate";
import EventView from "./components/EventView";
import EventSearch from "./components/EventSearch";
import OverlappingAlert from "./components/OverlappingAlert";
import Notifications from "./components/Notifications";

import {
  useEventForm,
  useEvents,
  useNotification,
  useSearch,
  useView,
} from "./hooks";

function App() {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEvents(
    !!editingEvent,
    resetForm
  );
  const { view, setView, currentDate, navigate, holidays } = useView();
  const {
    notifications,
    notifiedEvents,
    checkUpcomingEvents,
    closeNotification,
  } = useNotification();
  const { searchTerm, setSearchTerm, filteredEvents } = useSearch(
    events,
    currentDate,
    view
  );

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: "필수 정보를 모두 입력해주세요.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    validateTime(startTime, endTime);

    if (startTimeError || endTimeError) {
      toast({
        title: "시간 설정을 확인해주세요.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event = {
      id: editingEvent ? editingEvent.id : Date.now(),
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : "none",
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);

    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
    }
  };

  useInterval(() => {
    checkUpcomingEvents(events);
  }, 1000); // 1초마다 체크

  const onCloseOverlappingToggle = () => {
    () => setIsOverlapDialogOpen(false);
  };

  const onClickContinueBtn = () => {
    setIsOverlapDialogOpen(false);
    saveEvent({
      id: editingEvent ? editingEvent.id : Date.now(),
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : "none",
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    });
  };

  const eventAddOrUpdateProps = {
    editingEvent,
    title,
    setTitle,
    date,
    setDate,
    startTimeError,
    startTime,
    handleStartTimeChange,
    endTime,
    endTimeError,
    handleEndTimeChange,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    notificationTime,
    setNotificationTime,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    addOrUpdateEvent,
  };

  const eventSearchProps = {
    searchTerm,
    setSearchTerm,
    filteredEvents,
    notifiedEvents,
    editEvent,
    deleteEvent,
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        {/* 일정 추가 및 일정 수정 */}
        <EventAddOrUpdate {...eventAddOrUpdateProps} />

        {/* 일정 보기 */}
        <EventView
          view={view}
          setView={setView}
          navigate={navigate}
          currentDate={currentDate}
          holidays={holidays}
          filteredEvents={filteredEvents}
          notifiedEvents={notifiedEvents}
        />

        {/* 일정 검색 */}
        <EventSearch {...eventSearchProps} />
      </Flex>

      {/* 일정 겹침 경고 알럿창 */}
      <OverlappingAlert
        isOverlapDialogOpen={isOverlapDialogOpen}
        onCloseOverlappingToggle={onCloseOverlappingToggle}
        overlappingEvents={overlappingEvents}
        cancelRef={cancelRef}
        onClickContinueBtn={onClickContinueBtn}
      />

      {notifications.length > 0 && (
        <Notifications
          notifications={notifications}
          closeNotification={closeNotification}
        />
      )}
    </Box>
  );
}

export default App;
