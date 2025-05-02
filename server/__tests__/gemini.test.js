const {generateContent} = require("../helpers/gemini");

jest.mock("@google/generative-ai");
const {GoogleGenerativeAI} = require("@google/generative-ai");

describe("generateContent", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "dummy-key";
  });

  it("should return text from Gemini model", async () => {
    const mockText = "Hello from Gemini!";
    const mockGenerateContent = jest
      .fn()
      .mockResolvedValue({response: {text: () => mockText}});
    const mockGetGenerativeModel = jest
      .fn()
      .mockReturnValue({generateContent: mockGenerateContent});
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    }));

    const result = await generateContent("test prompt");
    expect(result).toBe(mockText);
    expect(mockGenerateContent).toHaveBeenCalledWith("test prompt");
  });

  it("should throw error if no API key", async () => {
    process.env.GEMINI_API_KEY = "";
    await expect(generateContent("test")).rejects.toThrow();
  });
});
