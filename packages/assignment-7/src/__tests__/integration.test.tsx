import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { mockApiHandlers, events, resetEvents } from "../mocks/mockApiHandlers";
import App from "../App";
import { getWeekDates } from "../utils/dateUtils";
import { notificationOptions } from "../constants";
import { Event } from "../types";

const SYSTEM_DATE = "2024-07-30T09:00:00";

const server = setupServer(...mockApiHandlers);

beforeAll(() => server.listen()); // 테스트 시작 전에 목 서버를 실행
afterAll(() => server.close()); // 테스트 종료 후에 목 서버 종료

describe("일정 관리 애플리케이션 통합 테스트", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
    vi.setSystemTime(new Date(SYSTEM_DATE)); // 시스템 시간을 2024-07-30으로 설정
    resetEvents(); // 각 테스트 전에 이벤트 초기화
  });

  afterEach(() => {
    server.resetHandlers(); // 각 테스트 후 핸들러 리셋
    vi.clearAllMocks();
    vi.runOnlyPendingTimers();
    vi.useRealTimers(); // 원래 시간으로 복원
  });

  describe("일정 CRUD 및 기본 기능", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    });

    test("초기 일정 중 현재 달의 일정들이 모두 렌더링 된다.", async () => {
      render(<App />);

      // 7월에 해당하는 이벤트들만 필터링
      const julyEvents = events.filter(
        (event) =>
          new Date(event.date).getMonth() === new Date(SYSTEM_DATE).getMonth()
      );

      for (const event of julyEvents) {
        await waitFor(() => {
          // 특정 이벤트 컨테이너가 렌더링될 때까지 기다림
          const eventContainer = screen.getByTestId(`event-${event.id}`);
          expect(eventContainer).toBeInTheDocument();

          // 컨테이너 내에서 이벤트 제목 확인
          const eventTitle = within(eventContainer).getByText(event.title);
          expect(eventTitle).toBeInTheDocument();
        });
      }
    });

    test("새로운 일정을 생성하면 '일정 보기'의 해당 날짜에 일정 제목이 추가된다.", async () => {
      render(<App />);

      const eventSubmitButton = screen.getByTestId("event-submit-button");
      expect(eventSubmitButton).toBeInTheDocument();

      const titleInput = screen.getByTestId("title-input");
      await user.type(titleInput, "Test Event");

      const dateInput = screen.getByTestId("date-input");
      await user.type(dateInput, "2024-07-30");

      const startTimeInput = screen.getByTestId("start-time-input");
      await user.type(startTimeInput, "10:00");

      const endTimeInput = screen.getByTestId("end-time-input");
      await user.type(endTimeInput, "11:00");

      await user.click(eventSubmitButton);

      const cell = screen.getByRole("cell", {
        name: /30 Test Event/,
      });

      expect(within(cell).getByText(/Test Event/)).toBeInTheDocument();
    });

    test("새로운 일정을 생성하면 '일정 검색 리스트'에 모든 필드가 노출된다.", async () => {
      render(<App />);

      const eventSubmitButton = screen.getByTestId("event-submit-button");
      expect(eventSubmitButton).toBeInTheDocument();

      const event = {
        id: 1,
        title: "새로운 이벤트 테스트",
        date: "2024-07-30",
        startTime: "10:00",
        endTime: "11:00",
        description: "주간 팀 미팅",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "weekly", interval: 1 },
        notificationTime: 1,
      };

      const titleInput = screen.getByTestId("title-input");
      await user.type(titleInput, event.title);

      const dateInput = screen.getByTestId("date-input");
      await user.type(dateInput, event.date);

      const startTimeInput = screen.getByTestId("start-time-input");
      await user.type(startTimeInput, event.startTime);

      const endTimeInput = screen.getByTestId("end-time-input");
      await user.type(endTimeInput, event.endTime);

      const descriptionInput = screen.getByTestId("description-input");
      await user.type(descriptionInput, event.description);

      const locationInput = screen.getByTestId("location-input");
      await user.type(locationInput, event.location);

      const categorySelect = screen.getByTestId("category-select");
      await user.type(categorySelect, event.category);

      await user.click(eventSubmitButton);

      await waitFor(() => {
        const eventList = screen.getByTestId("event-list"); // 이벤트 리스트의 data-testid
        const eventBoxes = within(eventList).getAllByRole("group"); // 모든 이벤트 박스를 찾습니다.

        // 새로운 이벤트가 추가되었는지 확인합니다.
        const createdEventBox = eventBoxes.find((box) =>
          within(box).queryByText(event.title)
        );
        expect(createdEventBox).not.toBeNull();

        if (createdEventBox) {
          expect(
            within(createdEventBox).getByText(event.title)
          ).toBeInTheDocument();
          expect(
            within(createdEventBox).getByText(event.date)
          ).toBeInTheDocument();
          expect(
            within(createdEventBox).getByText(
              `${event.startTime} - ${event.endTime}`
            )
          ).toBeInTheDocument();
          expect(
            within(createdEventBox).getByText(event.description)
          ).toBeInTheDocument();
          expect(
            within(createdEventBox).getByText(event.location)
          ).toBeInTheDocument();
          expect(
            within(createdEventBox).getByText(`카테고리: ${event.category}`)
          ).toBeInTheDocument();

          if (event.repeat.type !== "none") {
            const repeatText = `반복: ${event.repeat.interval}${
              event.repeat.type === "daily"
                ? "일"
                : event.repeat.type === "weekly"
                  ? "주"
                  : event.repeat.type === "monthly"
                    ? "월"
                    : event.repeat.type === "yearly"
                      ? "년"
                      : ""
            }마다`;
            expect(
              within(createdEventBox).getByText(repeatText)
            ).toBeInTheDocument();
          }

          const notificationLabel = notificationOptions.find(
            (option) => option.value === event.notificationTime
          )?.label;
          if (notificationLabel) {
            expect(
              within(createdEventBox).getByText(`알림: ${notificationLabel}`)
            ).toBeInTheDocument();
          }
        }
      });
    });

    test("기존 일정의 세부 정보를 수정하면 화면에 업데이트된 일정이 렌더링된다.", async () => {
      render(<App />);

      const originalEvent = events[0];
      const updatedTitle = "Updated 팀 회의";
      const updatedDescription = "Updated 주간 팀 미팅";

      // API 호출 후 이벤트 목록이 화면에 렌더링될 때까지 기다립니다.
      await waitFor(() => {
        expect(screen.getAllByText(originalEvent.title)[0]).toBeInTheDocument();
      });

      // 이벤트 ID를 기준으로 이벤트 컨테이너를 찾습니다.
      const eventContainer = screen.getByTestId(`event-${originalEvent.id}`);
      expect(eventContainer).not.toBeNull();

      // 이벤트 컨테이너 내에서 수정 버튼을 찾습니다.
      const editButton = within(eventContainer).getByTestId(
        `event-edit-icon-${originalEvent.id}`
      );
      await user.click(editButton);

      const titleInput = screen.getByTestId("title-input");
      await user.clear(titleInput);
      await user.type(titleInput, updatedTitle);

      const descriptionInput = screen.getByTestId("description-input");
      await user.clear(descriptionInput);
      await user.type(descriptionInput, updatedDescription);

      const eventSubmitButton = screen.getByRole("button", {
        name: /일정 수정/i,
      });
      await user.click(eventSubmitButton);

      // API 호출 후 업데이트된 이벤트가 화면에 렌더링될 때까지 기다립니다.
      await waitFor(() => {
        // 이벤트 ID를 기반으로 업데이트된 이벤트 컨테이너를 찾습니다.
        const updatedEventContainer = screen.getByTestId(
          `event-${originalEvent.id}`
        );
        expect(
          within(updatedEventContainer).getByText(updatedTitle)
        ).toBeInTheDocument();
        expect(
          within(updatedEventContainer).getByText(updatedDescription)
        ).toBeInTheDocument();
      });
    });

    test("일정을 삭제하고 화면에서 사라지는지 확인한다.", async () => {
      render(<App />);

      const eventToDelete = events[0];

      // 이벤트 ID를 기준으로 이벤트 컨테이너를 기다립니다.
      const eventContainer = await screen.findByTestId(
        `event-${eventToDelete.id}`
      );
      expect(eventContainer).not.toBeNull();

      // 이벤트 컨테이너 내에서 삭제 버튼을 찾습니다.
      const deleteButton = within(eventContainer).getByTestId(
        `event-delete-icon-${eventToDelete.id}`
      );
      await user.click(deleteButton);

      // API 호출 후 삭제된 이벤트가 화면에서 사라지는지 확인합니다.
      await waitFor(() => {
        expect(
          screen.queryByTestId(`event-${eventToDelete.id}`)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("일정 뷰 및 필터링", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    test("주별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.", async () => {
      render(<App />);

      // 주별 뷰로 전환
      const viewSelect = screen.getByLabelText("view");
      await user.selectOptions(viewSelect, "week");

      // 주별 뷰 렌더링 확인
      const weekView = await screen.findByTestId("week-view");
      expect(weekView).toBeInTheDocument();

      // 각 날짜에 일정이 없는지 확인
      const weekDates = getWeekDates(new Date()); // 일정이 없는 날짜
      for (const date of weekDates) {
        const dateText = screen.getByText(date.getDate().toString());
        const dateCell = dateText.closest("td");
        expect(dateCell).toBeInTheDocument();
        const eventsForDate = within(dateCell!).queryAllByRole("textbox");
        expect(eventsForDate).toHaveLength(0); // 일정 텍스트 요소가 없어야 함
      }
    });

    test("주별 뷰에서 각 날짜에 해당하는 일정이 올바르게 표시되는지 확인한다.", async () => {
      render(<App />);

      // 주별 뷰로 전환
      const viewSelect = screen.getByLabelText("view");
      await user.selectOptions(viewSelect, "week");

      // 주별 뷰 렌더링 확인
      const weekView = await screen.findByTestId("week-view");
      expect(weekView).toBeInTheDocument();

      // 현재 날짜로부터 주간 날짜를 가져옵니다.
      const weekDates = getWeekDates(new Date(SYSTEM_DATE));

      // 주별 뷰에서 각 날짜에 해당하는 일정이 올바르게 표시되는지 확인
      for (const date of weekDates) {
        const dateText = screen.getByText(date.getDate().toString());
        const dateCell = dateText.closest("td");
        expect(dateCell).toBeInTheDocument();

        // 해당 날짜에 일정을 필터링
        const eventsForDate = events.filter(
          (event) => new Date(event.date).toDateString() === date.toDateString()
        );

        for (const event of eventsForDate) {
          await waitFor(() => {
            const eventTitle = within(dateCell!).getByText(event.title);
            expect(eventTitle).toBeInTheDocument();
          });
        }
      }
    });

    test("월별 뷰에서 일정이 없으면 일정이 표시되지 않는지 확인한다.", async () => {
      render(<App />);

      // 월별 뷰로 전환
      const viewSelect = screen.getByLabelText("view");
      await user.selectOptions(viewSelect, "month");

      // 월별 뷰 렌더링 확인
      const monthView = await screen.findByTestId("month-view");
      expect(monthView).toBeInTheDocument();

      // 두 번 "Next" 버튼을 클릭하여 9월로 전환
      const navigateNextButton = screen.getByLabelText("Next");
      await user.click(navigateNextButton);
      await user.click(navigateNextButton);

      // 9월의 모든 날짜 셀 확인
      const allDateCells = screen.getAllByRole("cell");

      for (const dateCell of allDateCells) {
        await waitFor(() => {
          const eventsForDate = within(dateCell).queryAllByRole("heading");
          expect(eventsForDate).toHaveLength(0); // 일정 텍스트 요소가 없어야 함
        });
      }
    });

    test("월별 뷰에서 일정들이 모두 표시되는지 확인한다.", async () => {
      render(<App />);

      // 월별 뷰로 전환
      const viewSelect = screen.getByLabelText("view");
      await user.selectOptions(viewSelect, "month");

      // 월별 뷰 렌더링 확인
      const monthView = await screen.findByTestId("month-view");
      expect(monthView).toBeInTheDocument();

      // 7월의 모든 날짜 셀 확인
      const julyEvents = events.filter(
        (event) =>
          new Date(event.date).getMonth() === new Date(SYSTEM_DATE).getMonth()
      );

      for (const event of julyEvents) {
        const eventDate = new Date(event.date).getDate().toString();
        const eventTitle = event.title;

        await waitFor(() => {
          const cell = screen.getByRole("cell", {
            name: new RegExp(`${eventDate} ${eventTitle}`, "i"),
          });

          expect(cell).toBeInTheDocument();
        });
      }
    });
  });

  describe("알림 기능", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    test("일정 알림을 설정하고 지정된 시간에 알림이 발생하는지 확인한다.", async () => {
      const currentTime = new Date(SYSTEM_DATE);
      vi.setSystemTime(currentTime);
      render(<App />);

      // 현재 시간 기준으로 10분 후에 시작하는 이벤트를 추가
      const testEvent: Event = {
        id: 999,
        title: "알림테스트",
        description: "주간 팀 미팅",
        location: "회의실 A",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10, // 10분 전에 알림
        ...(() => {
          const now = currentTime;
          const startTime = new Date(now.getTime() + 5 * 60000); // 5분 후
          const endTime = new Date(startTime.getTime() + 60 * 60000); // 시작시간으로부터 1시간 후

          const formatDate = (date: Date) => {
            return date.toISOString().split("T")[0];
          };

          const formatTime = (date: Date) => {
            return date.toTimeString().split(" ")[0].substring(0, 5);
          };

          return {
            date: formatDate(now),
            startTime: formatTime(startTime),
            endTime: formatTime(endTime),
          };
        })(),
      };

      const eventSubmitButton = screen.getByTestId("event-submit-button");
      expect(eventSubmitButton).toBeInTheDocument();

      const titleInput = screen.getByTestId("title-input");
      await user.type(titleInput, testEvent.title);

      const dateInput = screen.getByTestId("date-input");
      await user.type(dateInput, testEvent.date);

      const startTimeInput = screen.getByTestId("start-time-input");
      await user.type(startTimeInput, testEvent.startTime);

      const endTimeInput = screen.getByTestId("end-time-input");
      await user.type(endTimeInput, testEvent.endTime);

      await user.click(eventSubmitButton);

      // 알림이 설정되었는지 확인
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
          screen.getByText(/10분 후 알림테스트 일정이 시작됩니다\./i)
        ).toBeInTheDocument();
      });

      // 알림 닫기 버튼 클릭하여 알림 삭제 확인
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);
      await waitFor(() => {
        expect(
          screen.queryByText(/10분 후 알림테스트 일정이 시작됩니다\./i)
        ).not.toBeInTheDocument();
      });

      vi.setSystemTime(currentTime);
    });
  });

  describe("검색 기능", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      user = userEvent.setup();
    });

    test("제목으로 일정을 검색하고 검색된 일정이 렌더링된다.", async () => {
      render(<App />);

      const searchBar = screen.getByRole("textbox", {
        name: /일정 검색/i,
      });

      // 검색어 입력
      await user.type(searchBar, "팀");

      // '팀'이 포함된 일정만 필터링되어 렌더링되는지 확인
      const filteredEvents = events.filter((event) =>
        event.title.includes("팀")
      );

      for (const event of filteredEvents) {
        await waitFor(() => {
          // 특정 이벤트 컨테이너가 렌더링될 때까지 기다림
          const eventContainer = screen.getByTestId(`event-${event.id}`);
          expect(eventContainer).toBeInTheDocument();

          // 컨테이너 내에서 이벤트 제목 확인
          const eventTitle = within(eventContainer).getByText(event.title);
          expect(eventTitle).toBeInTheDocument();
        });
      }
    });

    test("검색 결과가 없을 때 일정을 렌더링하지 않는다.", async () => {
      render(<App />);

      const searchBar = screen.getByRole("textbox", {
        name: /일정 검색/i,
      });

      // 존재하지 않는 검색어 입력
      await user.type(searchBar, "존재하지 않는 일정");

      // 검색 결과가 없을 때 일정이 렌더링되지 않는지 확인
      const filteredEvents = events.filter((event) =>
        event.title.includes("존재하지 않는 일정")
      );

      await waitFor(() => {
        filteredEvents.forEach((event) => {
          const eventContainer = screen.queryByTestId(`event-${event.id}`);
          expect(eventContainer).not.toBeInTheDocument();
        });
      });

      // 추가로 검색 결과가 없음을 표시하는 메시지 확인
      expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument();
    });

    test("'팀'으로 검색 후, 검색어를 지우면 7월의 모든 일정이 다시 렌더링된다.", async () => {
      render(<App />);

      const searchBar = screen.getByRole("textbox", {
        name: /일정 검색/i,
      });

      // 검색어 입력
      await user.type(searchBar, "팀");

      // '팀'이 포함된 일정만 필터링되어 렌더링되는지 확인
      const filteredEvents = events.filter((event) =>
        event.title.includes("팀")
      );

      for (const event of filteredEvents) {
        await waitFor(() => {
          // 특정 이벤트 컨테이너가 렌더링될 때까지 기다림
          const eventContainer = screen.getByTestId(`event-${event.id}`);
          expect(eventContainer).toBeInTheDocument();

          // 컨테이너 내에서 이벤트 제목 확인
          const eventTitle = within(eventContainer).getByText(event.title);
          expect(eventTitle).toBeInTheDocument();
        });
      }

      // 검색어 지우기
      await user.clear(searchBar);

      // 7월의 모든 일정이 다시 렌더링되는지 확인
      const julyEvents = events.filter(
        (event) =>
          new Date(event.date).getMonth() === new Date(SYSTEM_DATE).getMonth()
      );

      for (const event of julyEvents) {
        await waitFor(() => {
          const eventContainer = screen.getByTestId(`event-${event.id}`);
          expect(eventContainer).toBeInTheDocument();

          const eventTitle = within(eventContainer).getByText(event.title);
          expect(eventTitle).toBeInTheDocument();
        });
      }
    });
  });

  describe("공휴일 표시", () => {
    test("달력에 1월 1일(신정)이 공휴일로 빨간색으로 표시되는지 확인한다.", async () => {
      // 시간 설정을 1월 1일로 변경
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date("2024-01-01"));

      render(<App />);

      const monthView = await screen.findByTestId("month-view");

      await waitFor(() => {
        const januaryFirstCell = within(monthView).getByRole("cell", {
          name: /신정/,
        });

        const holidayText = within(januaryFirstCell).getByText("신정");
        expect(holidayText).toBeInTheDocument();
        expect(januaryFirstCell).toHaveTextContent("신정");
        expect(holidayText).toHaveStyle("color: red.500"); // 공휴일 텍스트가 빨간색으로 표시되는지 확인
      });
    });

    test("달력에 5월 5일(어린이날)이 공휴일로 빨간색으로 표시되는지 확인한다.", async () => {
      // 시간 설정을 5월 1일로 변경
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.setSystemTime(new Date("2024-05-01"));

      render(<App />);

      const monthView = await screen.findByTestId("month-view");

      await waitFor(() => {
        const mayFifthCell = within(monthView).getByRole("cell", {
          name: /5 어린이날/i,
        });

        const holidayText = within(mayFifthCell).getByText("어린이날");
        expect(holidayText).toBeInTheDocument();
        expect(mayFifthCell).toHaveTextContent("어린이날");
        expect(holidayText).toHaveStyle("color: red.500"); // 공휴일 텍스트가 빨간색으로 표시되는지 확인
      });
    });
  });

  describe("일정 충돌 감지", () => {
    test.fails("겹치는 시간에 새 일정을 추가할 때 경고가 표시되는지 확인한다");
    test.fails(
      "기존 일정의 시간을 수정하여 충돌이 발생할 때 경고가 표시되는지 확인한다"
    );
  });
});
