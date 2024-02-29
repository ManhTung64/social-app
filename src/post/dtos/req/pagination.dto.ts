import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationDto {
    private MIN_PAGE:number = 1
    private MIN_LIMIT:number = 10
    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = this.MIN_PAGE;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit: number = this.MIN_LIMIT;
}