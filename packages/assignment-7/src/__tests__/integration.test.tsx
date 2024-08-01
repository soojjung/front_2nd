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
import { mockApiHandlers, events, resetEvents } from "../mockApiHandlers";
import App from "../App";
import { getWeekDates } from "../utils/dateUtils";
import { notificationOptions } from "../constants";

const server = setupServer(...mockApiHandlers);

beforeAll(() => server.listen()); // 테스트 시작 전에 목 서버를 실행
afterAll(() => server.close()); // 테스트 종료 후에 목 서버 종료

describe("일정 관리 애플리케이션 통합 테스트", () => {
  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });
    vi.setSystemTime(new Date("2024-07-30")); // 시스템 시간을 2024-07-30으로 설정
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

    test("초기 일정이 모두 렌더링 된다.", async () => {
      render(<App />);

      // 7월에 해당하는 이벤트들만 필터링
      const julyEvents = events.filter(
        (event) => new Date(event.date).getMonth() === 6
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

    test("기존 일정의 세부 정보를 수정하고 화면에 업데이트된 일정이 렌더링된다.", async () => {
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
      const weekDates = getWeekDates(new Date());
      for (const date of weekDates) {
        const dateText = screen.getByText(date.getDate().toString());
        const dateCell = dateText.closest("td");
        expect(dateCell).toBeInTheDocument();
        const eventsForDate = within(dateCell!).queryAllByRole("textbox");
        expect(eventsForDate).toHaveLength(0); // 일정 텍스트 요소가 없어야 함
      }
    });

    test.fails("주별 뷰에 일정이 정확히 표시되는지 확인한다");
    test.fails("월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.");
    test.fails("월별 뷰에 일정이 정확히 표시되는지 확인한다");
  });

  describe("알림 기능", () => {
    test.fails("일정 알림을 설정하고 지정된 시간에 알림이 발생하는지 확인한다");
  });

  describe("검색 기능", () => {
    test.fails("제목으로 일정을 검색하고 정확한 결과가 반환되는지 확인한다");
    test.fails("제목으로 일정을 검색하고 정확한 결과가 반환되는지 확인한다");
    test.fails("검색어를 지우면 모든 일정이 다시 표시되어야 한다");
  });

  describe("공휴일 표시", () => {
    test.fails("달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다");
    test.fails("달력에 5월 5일(어린이날)이 공휴일로 표시되는지 확인한다");
  });

  describe("일정 충돌 감지", () => {
    test.fails("겹치는 시간에 새 일정을 추가할 때 경고가 표시되는지 확인한다");
    test.fails(
      "기존 일정의 시간을 수정하여 충돌이 발생할 때 경고가 표시되는지 확인한다"
    );
  });
});
