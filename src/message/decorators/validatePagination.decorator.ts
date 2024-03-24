import { ValidationArguments, ValidationOptions, isInt, isUUID, registerDecorator } from "class-validator";

export function ValidatePage(
    isNotEmpty: boolean = false,
    min: number = 0,
    max: number = 1000,
    validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validatePage',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const notEx:boolean = (value === undefined || value === null)
                    if (isNotEmpty && notEx) return false
                    else if (!isNotEmpty && notEx)  return true
                    else if (!notEx && !isInt(parseFloat(value))) return false
                    else if (!notEx && (min > value  || value > max)) return false
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} is null or invalid`
                }
            },
        });
    };
}

export function ValidateLimit(
    isNotEmpty: boolean = false,
    limit:number,
    validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateLimit',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const notEx:boolean = (value === undefined || value === null)
                    if (isNotEmpty && notEx) return false
                    else if (!isNotEmpty && notEx)  return true
                    else if (limit != value) return false
                    return true;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} cannot change`
                }
            },
        });
    };
}

