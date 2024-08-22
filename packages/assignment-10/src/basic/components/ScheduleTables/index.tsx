import { memo } from "react";
import { Flex } from "@chakra-ui/react";
import ScheduleTableWrapper from "./ScheduleTableWrapper";
import { useScheduleContext } from "../../ScheduleContext.tsx";
import { useSearchInfo } from "../../hooks/useSearchInfo.ts";
import SearchDialog from "./SearchDialog/index.tsx";

const ScheduleTables = memo(() => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const { searchInfo, onAdd, onScheduleTimeClick, onClose } = useSearchInfo();

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
          <ScheduleTableWrapper
            key={tableId}
            tableId={tableId}
            schedules={schedules}
            index={index}
            isDisabled={disabledRemoveButton}
            setSchedulesMap={setSchedulesMap}
            onAdd={onAdd}
            onScheduleTimeClick={onScheduleTimeClick}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={onClose} />
    </>
  );
});

export default ScheduleTables;
