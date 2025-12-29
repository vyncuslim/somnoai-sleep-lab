import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  parseStepCount,
  parseActivitySegments,
  parseSleepSegments,
  parseHeartRate,
} from "./googleFitAPI";

describe("Google Fit API Data Parsing", () => {
  describe("parseStepCount", () => {
    it("should parse step count data correctly", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640086400000000000",
                    value: [{ intVal: 8500 }],
                  },
                ],
              },
            ],
          },
          {
            startTimeMillis: "1640086400000",
            endTimeMillis: "1640172800000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640086400000000000",
                    endTimeNanos: "1640172800000000000",
                    value: [{ intVal: 10200 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseStepCount(mockData);
      expect(result).toEqual([8500, 10200]);
    });

    it("should return empty array for null data", () => {
      const result = parseStepCount(null);
      expect(result).toEqual([]);
    });

    it("should handle missing data points", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [],
          },
        ],
      };

      const result = parseStepCount(mockData);
      expect(result).toEqual([0]);
    });
  });

  describe("parseActivitySegments", () => {
    it("should parse activity segments correctly", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640003600000000000",
                    value: [{ intVal: 1 }], // Walking
                  },
                  {
                    startTimeNanos: "1640003600000000000",
                    endTimeNanos: "1640007200000000000",
                    value: [{ intVal: 2 }], // Running
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseActivitySegments(mockData);
      expect(result).toHaveLength(2);
      expect(result[0].activity).toBe("步行");
      expect(result[1].activity).toBe("跑步");
      expect(result[0].duration).toBe(3600000); // 1 hour
      expect(result[1].duration).toBe(3600000); // 1 hour
    });

    it("should return empty array for null data", () => {
      const result = parseActivitySegments(null);
      expect(result).toEqual([]);
    });

    it("should handle unknown activity codes", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640003600000000000",
                    value: [{ intVal: 999 }], // Unknown activity
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseActivitySegments(mockData);
      expect(result).toHaveLength(1);
      expect(result[0].activity).toBe("其他");
    });
  });

  describe("parseSleepSegments", () => {
    it("should parse sleep segments correctly", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640003600000000000",
                    value: [{ intVal: 1 }], // Light sleep
                  },
                  {
                    startTimeNanos: "1640003600000000000",
                    endTimeNanos: "1640007200000000000",
                    value: [{ intVal: 2 }], // Deep sleep
                  },
                  {
                    startTimeNanos: "1640007200000000000",
                    endTimeNanos: "1640010800000000000",
                    value: [{ intVal: 3 }], // REM sleep
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseSleepSegments(mockData);
      expect(result).toHaveLength(3);
      expect(result[0].stage).toBe("浅睡眠");
      expect(result[1].stage).toBe("深睡眠");
      expect(result[2].stage).toBe("快速眼动睡眠");
    });

    it("should return empty array for null data", () => {
      const result = parseSleepSegments(null);
      expect(result).toEqual([]);
    });

    it("should calculate sleep duration correctly", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640007200000000000", // 2 hours
                    value: [{ intVal: 1 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseSleepSegments(mockData);
      expect(result[0].duration).toBe(7200000); // 2 hours in milliseconds
    });
  });

  describe("parseHeartRate", () => {
    it("should parse heart rate data correctly", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640003600000000000",
                    value: [{ fpVal: 72.5 }],
                  },
                  {
                    startTimeNanos: "1640003600000000000",
                    endTimeNanos: "1640007200000000000",
                    value: [{ fpVal: 85.3 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseHeartRate(mockData);
      expect(result).toHaveLength(2);
      expect(result[0].bpm).toBe(73); // Rounded from 72.5
      expect(result[1].bpm).toBe(85); // Rounded from 85.3
    });

    it("should return empty array for null data", () => {
      const result = parseHeartRate(null);
      expect(result).toEqual([]);
    });

    it("should handle zero heart rate values", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640003600000000000",
                    value: [{ fpVal: 0 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseHeartRate(mockData);
      expect(result[0].bpm).toBe(0);
    });
  });

  describe("Data Parsing Edge Cases", () => {
    it("should handle empty bucket array", () => {
      const mockData = { bucket: [] };

      expect(parseStepCount(mockData)).toEqual([]);
      expect(parseActivitySegments(mockData)).toEqual([]);
      expect(parseSleepSegments(mockData)).toEqual([]);
      expect(parseHeartRate(mockData)).toEqual([]);
    });

    it("should handle missing value arrays", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640086400000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000",
                    endTimeNanos: "1640003600000000000",
                    value: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const stepResult = parseStepCount(mockData);
      expect(stepResult[0]).toBe(0);
    });

    it("should handle timestamp conversion correctly", () => {
      const mockData = {
        bucket: [
          {
            startTimeMillis: "1640000000000",
            endTimeMillis: "1640003600000",
            dataset: [
              {
                point: [
                  {
                    startTimeNanos: "1640000000000000000", // 2021-12-20 16:00:00 UTC
                    endTimeNanos: "1640003600000000000", // 2021-12-20 17:00:00 UTC
                    value: [{ intVal: 100 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = parseActivitySegments(mockData);
      expect(result[0].startTime).toBeInstanceOf(Date);
      expect(result[0].endTime).toBeInstanceOf(Date);
      expect(result[0].duration).toBe(3600000); // 1 hour
    });
  });
});
