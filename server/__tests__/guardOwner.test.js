const guardOwner = require("../middlewares/guardOwner");

describe("guardOwner middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {user: {id: 1}, params: {id: "1"}};
    res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    next = jest.fn();
  });

  it("should call next if user is owner", async () => {
    // Mock Review.findByPk to return review with userId = req.user.id
    jest
      .spyOn(require("../models").Review, "findByPk")
      .mockResolvedValueOnce({userId: 1});
    await guardOwner(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should call next with Forbidden error if user is not owner", async () => {
    jest.spyOn(require("../models").Review, "findByPk").mockResolvedValueOnce({ userId: 2 });
    await guardOwner(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: "Forbidden" }));
  });

  it("should call next with NotFound error if review not found", async () => {
    jest.spyOn(require("../models").Review, "findByPk").mockResolvedValueOnce(null);
    await guardOwner(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ name: "NotFound" }));
  });

  it("should call next with error if exception thrown", async () => {
    jest
      .spyOn(require("../models").Review, "findByPk")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    await guardOwner(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
