import { LineChart } from "react-native-gifted-charts";

type Props = {
  values: number[];
  color?: string;
};

export default function SparklineChart({ values, color = "#73c441" }: Props) {
  return (
    <LineChart
      data={values.map((value) => ({ value }))}
      height={46}
      width={72}
      thickness={2}
      color={color}
      hideDataPoints
      hideRules
      hideYAxisText
      yAxisColor="transparent"
      xAxisColor="transparent"
      initialSpacing={0}
      endSpacing={0}
      curved
    />
  );
}
