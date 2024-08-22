import { memo } from "react";
import { Box, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { Lecture } from "../../../../types";
import LectureTableRow from "./LectureTableRow";

type Props = {
  loaderWrapperRef: React.RefObject<HTMLDivElement>;
  loaderRef: React.RefObject<HTMLDivElement>;
  visibleLectures: Lecture[];
  addSchedule: (lecture: Lecture) => void;
};

const LectureTable = ({
  loaderWrapperRef,
  loaderRef,
  visibleLectures,
  addSchedule,
}: Props) => {
  return (
    <Box>
      <Table>
        <Thead>
          <Tr>
            <Th width="100px">과목코드</Th>
            <Th width="50px">학년</Th>
            <Th width="200px">과목명</Th>
            <Th width="50px">학점</Th>
            <Th width="150px">전공</Th>
            <Th width="150px">시간</Th>
            <Th width="80px"></Th>
          </Tr>
        </Thead>
      </Table>

      <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
        <Table size="sm" variant="striped">
          <Tbody>
            {visibleLectures.map((lecture, index) => (
              <LectureTableRow
                key={`${lecture.id}-${index}`}
                lecture={lecture}
                addSchedule={addSchedule}
              />
            ))}
          </Tbody>
        </Table>
        <Box ref={loaderRef} h="20px" />
      </Box>
    </Box>
  );
};

export default memo(LectureTable);
