import { ChangeEvent } from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotification, useView, useEventForm } from "../hooks";
import { fetchHolidays } from "../mocks/mockFetchHolidays";
import { Event } from "../types";

vi.mock("../mocks/mockFetchHolidays", () => ({
  fetchHolidays: vi.fn(),
}));

describe("커스텀 훅 테스트", () => {
  describe("useNotification", () => {
    const events: Event[] = [
      {
        id: 1,
        title: "Event 1",
        date: "2024-07-25",
        startTime: "10:00",
        endTime: "11:00",
        description: "Event 1 description",
        location: "Location 1",
        category: "Work",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10,
      },
      {
        id: 2,
        title: "Event 2",
        date: "2024-07-25",
        startTime: "12:00",
        endTime: "13:00",
        description: "Event 2 description",
        location: "Location 2",
        category: "Personal",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10,
      },
    ];

    test("알림이 제대로 설정되는지 확인한다", async () => {
      vi.useFakeTimers();
      const now = new Date("2024-07-25T09:55:00");
      vi.setSystemTime(now);

      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.checkUpcomingEvents(events);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toEqual({
        id: 1,
        message: "10분 후 Event 1 일정이 시작됩니다.",
      });

      vi.useRealTimers();
    });

    test("알림을 닫으면 알림 목록에서 제거되는지 확인한다", async () => {
      const { result } = renderHook(() => useNotification());

      await act(async () => {
        await result.current.checkUpcomingEvents(events);
      });

      act(() => {
        result.current.closeNotification(0);
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe("useView", () => {
    const mockFetchHolidays = fetchHolidays as unknown as ReturnType<
      typeof vi.fn
    >;

    const SYSTEM_DATE = "2024-08-01T00:00:00.000Z"; // 테스트 시간 고정

    beforeEach(() => {
      vi.useFakeTimers({
        shouldAdvanceTime: true,
      });
      vi.setSystemTime(new Date(SYSTEM_DATE));
      mockFetchHolidays.mockClear();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("기본 뷰와 날짜를 설정한다", () => {
      const { result } = renderHook(() => useView());
      expect(result.current.view).toBe("month");
      expect(result.current.currentDate).toEqual(new Date(SYSTEM_DATE));
    });

    test("view를 변경할 수 있다", () => {
      const { result } = renderHook(() => useView());

      act(() => {
        result.current.setView("week");
      });

      expect(result.current.view).toBe("week");
    });

    test("현재 날짜를 이전 달로 변경한다", () => {
      const { result } = renderHook(() => useView());

      act(() => {
        result.current.setView("month");
        result.current.navigate("prev");
      });

      const expectedDate = new Date(SYSTEM_DATE);
      expectedDate.setMonth(expectedDate.getMonth() - 1);
      expect(result.current.currentDate).toEqual(expectedDate);
    });

    test("현재 날짜를 다음 달로 변경한다", () => {
      const { result } = renderHook(() => useView());

      act(() => {
        result.current.setView("month");
        result.current.navigate("next");
      });

      const expectedDate = new Date(SYSTEM_DATE);
      expectedDate.setMonth(expectedDate.getMonth() + 1);
      expect(result.current.currentDate).toEqual(expectedDate);
    });

    test("현재 날짜가 변경되면 공휴일을 가져온다", () => {
      const mockHolidays = { "2024-07-01": "Test Holiday" };
      mockFetchHolidays.mockReturnValue(mockHolidays);

      const { result } = renderHook(() => useView());

      act(() => {
        result.current.setView("month");
        result.current.navigate("next");
      });

      const nextMonth = new Date(SYSTEM_DATE);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      expect(mockFetchHolidays).toHaveBeenCalledWith(
        nextMonth.getFullYear(),
        nextMonth.getMonth() + 1
      );
      expect(result.current.holidays).toEqual(mockHolidays);
    });
  });

  describe("useEventForm", () => {
    test("초기 상태를 확인한다", () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.title).toBe("");
      expect(result.current.date).toBe("");
      expect(result.current.startTime).toBe("");
      expect(result.current.endTime).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.location).toBe("");
      expect(result.current.category).toBe("");
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe("none");
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe("");
      expect(result.current.notificationTime).toBe(10);
      expect(result.current.startTimeError).toBeNull();
      expect(result.current.endTimeError).toBeNull();
      expect(result.current.editingEvent).toBeNull();
    });

    test("상태가 올바르게 업데이트되는지 확인한다", () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle("New Event");
        result.current.setDate("2024-07-25");
        result.current.setStartTime("10:00");
        result.current.setEndTime("11:00");
        result.current.setDescription("Event Description");
        result.current.setLocation("Event Location");
        result.current.setCategory("Work");
        result.current.setIsRepeating(true);
        result.current.setRepeatType("weekly");
        result.current.setRepeatInterval(2);
        result.current.setRepeatEndDate("2024-12-31");
        result.current.setNotificationTime(15);
      });

      expect(result.current.title).toBe("New Event");
      expect(result.current.date).toBe("2024-07-25");
      expect(result.current.startTime).toBe("10:00");
      expect(result.current.endTime).toBe("11:00");
      expect(result.current.description).toBe("Event Description");
      expect(result.current.location).toBe("Event Location");
      expect(result.current.category).toBe("Work");
      expect(result.current.isRepeating).toBe(true);
      expect(result.current.repeatType).toBe("weekly");
      expect(result.current.repeatInterval).toBe(2);
      expect(result.current.repeatEndDate).toBe("2024-12-31");
      expect(result.current.notificationTime).toBe(15);
    });

    test("이벤트 편집 기능이 올바르게 동작하는지 확인한다", () => {
      const { result } = renderHook(() => useEventForm());

      const event: Event = {
        id: 1,
        title: "Existing Event",
        date: "2024-07-25",
        startTime: "10:00",
        endTime: "11:00",
        description: "Existing Description",
        location: "Existing Location",
        category: "Personal",
        repeat: { type: "monthly", interval: 1 },
        notificationTime: 20,
      };

      act(() => {
        result.current.editEvent(event);
      });

      expect(result.current.editingEvent).toEqual(event);
      expect(result.current.title).toBe("Existing Event");
      expect(result.current.date).toBe("2024-07-25");
      expect(result.current.startTime).toBe("10:00");
      expect(result.current.endTime).toBe("11:00");
      expect(result.current.description).toBe("Existing Description");
      expect(result.current.location).toBe("Existing Location");
      expect(result.current.category).toBe("Personal");
      expect(result.current.isRepeating).toBe(true);
      expect(result.current.repeatType).toBe("monthly");
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe("");
      expect(result.current.notificationTime).toBe(20);
    });

    test("폼이 리셋되는지 확인한다", () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle("Event to Reset");
        result.current.resetForm();
      });

      expect(result.current.title).toBe("");
      expect(result.current.date).toBe("");
      expect(result.current.startTime).toBe("");
      expect(result.current.endTime).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.location).toBe("");
      expect(result.current.category).toBe("");
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatType).toBe("none");
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe("");
      expect(result.current.notificationTime).toBe(10);
    });

    test("시작 시간 변경 시 유효성 검사가 동작하는지 확인한다", () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.handleStartTimeChange({
          target: { value: "09:00" },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.startTime).toBe("09:00");
      expect(result.current.startTimeError).toBeNull();
    });
  });
});
