import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ListProductsQueryDto } from "./list-products.dto";

describe("ListProductsQueryDto", () => {
  it("defaults page/pageSize/locale when omitted", async () => {
    const dto = plainToInstance(ListProductsQueryDto, {});
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.pageSize).toBe(20);
    expect(dto.locale).toBe("ar");
  });

  it("rejects a pageSize above the max", async () => {
    const dto = plainToInstance(ListProductsQueryDto, { pageSize: 500 });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "pageSize")).toBe(true);
  });

  it("rejects an unsupported locale", async () => {
    const dto = plainToInstance(ListProductsQueryDto, { locale: "fr" });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "locale")).toBe(true);
  });
});
