import { memo } from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { SearchOption } from "../index";

type Props = {
  selectedSubject?: string;
  changeSearchOption: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
};

const SubjectSelectForm = ({ selectedSubject, changeSearchOption }: Props) => {
  return (
    <FormControl>
      <FormLabel>검색어</FormLabel>
      <Input
        placeholder="과목명 또는 과목코드"
        value={selectedSubject}
        onChange={(e) => changeSearchOption("query", e.target.value)}
      />
    </FormControl>
  );
};

export default memo(SubjectSelectForm);
