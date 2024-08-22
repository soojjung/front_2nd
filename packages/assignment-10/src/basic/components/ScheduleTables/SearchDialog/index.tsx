/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useScheduleContext } from "../../../ScheduleContext.tsx";
import { Lecture } from "../../../types.ts";
import { parseSchedule } from "../../../utils.ts";

import {
  SubjectSelectForm,
  CreditSelectForm,
  GradeSelectForm,
  DaySelectForm,
  TimeSelectForm,
  MajorSelectForm,
} from "./selectForms";
import { PAGE_SIZE } from "../../../constants.ts";
import LectureTable from "./LectureTable";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

export interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

const createCachedApiCall = () => {
  const cache: { [key: string]: Promise<any> } = {};

  return (key: string, apiFunction: () => Promise<any>) => {
    if (!cache[key]) {
      console.log(`API Call ${key}`, performance.now());
      cache[key] = apiFunction();
    } else {
      console.log(`Returning cached result for ${key}`);
    }
    return cache[key];
  };
};

const fetchAllLectures = async () => {
  const cachedApiCall = createCachedApiCall();

  const results = await Promise.all([
    cachedApiCall("1", fetchMajors),
    cachedApiCall("2", fetchLiberalArts),
    cachedApiCall("3", fetchMajors), // 캐시된 결과를 사용
    cachedApiCall("4", fetchLiberalArts), // 캐시된 결과를 사용
    cachedApiCall("5", fetchMajors), // 캐시된 결과를 사용
    cachedApiCall("6", fetchLiberalArts), // 캐시된 결과를 사용
  ]);

  return results;
};

const SearchDialog = ({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchCompleted, setSearchCompleted] = useState(false); // 검색 완료 여부 상태 추가
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: "",
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  const filteredLectures = useMemo(() => {
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    return lectures.filter((lecture) => {
      const matchesQuery =
        lecture.title.toLowerCase().includes(query.toLowerCase()) ||
        lecture.id.toLowerCase().includes(query.toLowerCase());

      const matchesGrade =
        grades.length === 0 || grades.indexOf(lecture.grade) > -1;

      const matchesMajor =
        majors.length === 0 || majors.indexOf(lecture.major) > -1;

      const matchesCredits =
        !credits || lecture.credits.startsWith(String(credits));

      const matchesDays =
        days.length === 0 ||
        (lecture.schedule
          ? parseSchedule(lecture.schedule).some(
              (s) => days.indexOf(s.day) > -1
            )
          : false);

      const matchesTimes =
        times.length === 0 ||
        (lecture.schedule
          ? parseSchedule(lecture.schedule).some((s) =>
              s.range.some((time) => times.indexOf(time) > -1)
            )
          : false);

      return (
        matchesQuery &&
        matchesGrade &&
        matchesMajor &&
        matchesCredits &&
        matchesDays &&
        matchesTimes
      );
    });
  }, [searchOptions, lectures]);

  const lastPage = useMemo(
    () => Math.ceil(filteredLectures.length / PAGE_SIZE),
    [filteredLectures]
  );

  const visibleLectures = filteredLectures.slice(0, page * PAGE_SIZE);

  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures]
  );

  const changeSearchOption = useCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setPage(1);
      setSearchOptions({ ...searchOptions, [field]: value });
      loaderWrapperRef.current?.scrollTo(0, 0);
    },
    [searchOptions]
  );

  const addSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) {
        return;
      }

      const { tableId } = searchInfo;

      const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
        ...schedule,
        lecture,
      }));

      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: [...prev[tableId], ...schedules],
      }));

      onClose();
    },
    [searchInfo, onClose, setSchedulesMap]
  );

  useEffect(() => {
    if (searchCompleted) {
      return; // 이미 검색이 완료되었으면 추가 검색을 막음
    }

    const start = performance.now();
    console.log("API 호출 시작: ", start);
    fetchAllLectures().then((results) => {
      const end = performance.now();
      console.log("모든 API 호출 완료 ", end);
      console.log("API 호출에 걸린 시간(ms): ", end - start);
      setLectures(results.flatMap((result) => result.data));
      setSearchCompleted(true); // 검색 완료 상태로 설정
    });
  }, [searchCompleted]);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => Math.min(lastPage, prevPage + 1));
      }
    };

    const observerOptions = {
      threshold: 0.5,
      root: $loaderWrapper,
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    observer.observe($loader);

    return () => {
      observer.disconnect();
    };
  }, [lastPage, loaderRef, loaderWrapperRef]);

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <SubjectSelectForm
                selectedSubject={searchOptions.query}
                changeSearchOption={changeSearchOption}
              />
              <CreditSelectForm
                selectedCredits={searchOptions.credits}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <HStack spacing={4}>
              <GradeSelectForm
                selectedGrades={searchOptions.grades}
                changeSearchOption={changeSearchOption}
              />

              <DaySelectForm
                selectedDays={searchOptions.days}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <HStack spacing={4}>
              <TimeSelectForm
                selectedTimes={searchOptions.times}
                changeSearchOption={changeSearchOption}
              />

              <MajorSelectForm
                selectedMajors={searchOptions.majors}
                allMajors={allMajors}
                changeSearchOption={changeSearchOption}
              />
            </HStack>

            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <LectureTable
              loaderWrapperRef={loaderWrapperRef}
              loaderRef={loaderRef}
              visibleLectures={visibleLectures}
              addSchedule={addSchedule}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default memo(SearchDialog);
