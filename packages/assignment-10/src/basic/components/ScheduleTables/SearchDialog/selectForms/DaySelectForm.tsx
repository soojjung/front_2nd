import { memo } from "react";
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Checkbox,
  HStack,
} from "@chakra-ui/react";
import { SearchOption } from "../index";
import { DAY_LABELS } from "../../../../constants";

type Props = {
  selectedDays?: string[];
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
};

const DaySelectForm = ({ selectedDays, changeSearchOption }: Props) => {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup
        value={selectedDays}
        onChange={(value) => changeSearchOption("days", value as string[])}
      >
        <HStack spacing={4}>
          {DAY_LABELS.map((day) => (
            <Checkbox key={day} value={day}>
              {day}
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
};

export default memo(DaySelectForm);
