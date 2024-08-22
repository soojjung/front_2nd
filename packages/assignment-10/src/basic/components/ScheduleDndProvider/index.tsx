/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { PropsWithChildren, useCallback } from "react";
import { CellSize, DAY_LABELS } from "../../constants.ts";
import { useScheduleContext } from "../../ScheduleContext.tsx";

type DayType = "월" | "화" | "수" | "목" | "금" | "토";

function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    if (!containerNodeRect || !draggingNodeRect) return transform;

    const minX = containerNodeRect.left - draggingNodeRect.left + 121;
    const minY = containerNodeRect.top - draggingNodeRect.top + 41;
    const maxX = containerNodeRect.right - draggingNodeRect.right;
    const maxY = containerNodeRect.bottom - draggingNodeRect.bottom;

    return {
      ...transform,
      x: Math.min(
        Math.max(
          Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH,
          minX
        ),
        maxX
      ),
      y: Math.min(
        Math.max(
          Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
          minY
        ),
        maxY
      ),
    };
  };
}

const modifiers = [createSnapModifier()];

export default function ScheduleDndProvider({ children }: PropsWithChildren) {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, delta } = event;
      const [tableId, index] = active.id.split(":");
      const schedule = schedulesMap[tableId][index];

      const nowDayIndex = DAY_LABELS.indexOf(schedule.day as DayType);
      const moveDayIndex = Math.floor(delta.x / 80);
      const moveTimeIndex = Math.floor(delta.y / 30);

      if (moveDayIndex !== 0 || moveTimeIndex !== 0) {
        setSchedulesMap((prev) => ({
          ...prev,
          [tableId]: prev[tableId].map((targetSchedule, targetIndex) => {
            if (targetIndex === Number(index)) {
              return {
                ...targetSchedule,
                day: DAY_LABELS[nowDayIndex + moveDayIndex] as DayType,
                range: targetSchedule.range.map((time) => time + moveTimeIndex),
              };
            }
            return targetSchedule;
          }),
        }));
      }
    },
    [schedulesMap, setSchedulesMap]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      modifiers={modifiers}
    >
      {children}
    </DndContext>
  );
}
