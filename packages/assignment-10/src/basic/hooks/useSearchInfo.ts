import { useState } from "react";

export const useSearchInfo = () => {
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const onAdd = (tableId: string) => setSearchInfo({ tableId });

  const onScheduleTimeClick = (
    timeInfo: { day: string; time: number },
    tableId: string
  ) => setSearchInfo({ tableId, ...timeInfo });

  const onClose = () => setSearchInfo(null);

  return { searchInfo, onAdd, onScheduleTimeClick, onClose };
};
