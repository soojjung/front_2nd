import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { Schedule } from "../../../types";
import ScheduleTable from "./ScheduleTable";

interface Props {
  tableId: string;
  schedules: Schedule[];
  index: number;
  isDisabled: boolean;
  setSchedulesMap: React.Dispatch<
    React.SetStateAction<Record<string, Schedule[]>>
  >;
  onAdd: (tableId: string) => void;
  onScheduleTimeClick: (
    timeInfo: { day: string; time: number },
    tableId: string
  ) => void;
}

const ScheduleTableWrapper = ({
  tableId,
  schedules,
  index,
  isDisabled,
  setSchedulesMap,
  onAdd,
  onScheduleTimeClick,
}: Props) => {
  const duplicate = (targetId: string) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[targetId]],
    }));
  };

  const remove = (targetId: string) => {
    setSchedulesMap((prev) => {
      delete prev[targetId];
      return { ...prev };
    });
  };

  return (
    <Stack key={tableId} width="600px">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h3" fontSize="lg">
          시간표 {index + 1}
        </Heading>
        <ButtonGroup size="sm" isAttached>
          <Button colorScheme="green" onClick={() => onAdd(tableId)}>
            시간표 추가
          </Button>
          <Button
            colorScheme="green"
            mx="1px"
            onClick={() => duplicate(tableId)}
          >
            복제
          </Button>
          <Button
            colorScheme="green"
            isDisabled={isDisabled}
            onClick={() => remove(tableId)}
          >
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
      <ScheduleTable
        key={`schedule-table-${index}`}
        schedules={schedules}
        tableId={tableId}
        onScheduleTimeClick={(timeInfo, tableId) =>
          onScheduleTimeClick(timeInfo, tableId)
        }
        onDeleteButtonClick={({ day, time }) =>
          setSchedulesMap((prev) => ({
            ...prev,
            [tableId]: prev[tableId].filter(
              (schedule) =>
                schedule.day !== day || !schedule.range.includes(time)
            ),
          }))
        }
      />
    </Stack>
  );
};

export default ScheduleTableWrapper;
