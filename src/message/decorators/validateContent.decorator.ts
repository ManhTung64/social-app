import { Injectable } from "@nestjs/common";
import { CensoredService } from "../services/badword.service";
import { ValidationError, ValidationOptions, registerDecorator } from "class-validator";

@Injectable()
export class ContentValidator {
    private static sensoredService:CensoredService
    constructor(sensoredService: CensoredService) {
        ContentValidator.sensoredService = sensoredService
     }

    static censoredContent(content: string): string[] {
        return ContentValidator.sensoredService.badword.search(content);
    }
}


export function ValidateContent(maxLength: number = 1000, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateContent',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: string) {
                    const notEx:boolean = (value === undefined || value === null)
                    if (notEx) return true
                    // Check if the property value is a string
                    else if (typeof value !== 'string') return false
                    else if (value.length > maxLength) return false
                    else if (ContentValidator.censoredContent(value).length > 0) return false
                    return true;
                },
                defaultMessage(){
                    return 'This content too long or contains impolites words'
                }
            },
        });
    };
}
