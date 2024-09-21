import {
  LineChart,
} from "react-native-chart-kit";

import {View} from 'react-native'

export function LineChartComponent({ data, labels, width, height }) {
  return (
    <View>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
            },
          ],
        }}
        width= {width}
        height={height}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#transparent",
          backgroundGradientFrom: "#0E133C",
          backgroundGradientTo: "#0E133C",
          decimalPlaces: 2, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ED8BC9",
          },
        }}
        bezier
        style={{
          marginTop: 16,
          marginBottom: 16,
          borderRadius: 10,
          marginRight: 20,
          justifyContent: "center",
          alignItems: "center"
        }}
      />
    </View>
  );
}
