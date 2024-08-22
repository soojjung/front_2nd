import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleProvider } from "./ScheduleContext.tsx";
import ScheduleTables from "./components/ScheduleTables/index.tsx";
import ScheduleDndProvider from "./components/ScheduleDndProvider/index.tsx";

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          <ScheduleTables />
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
