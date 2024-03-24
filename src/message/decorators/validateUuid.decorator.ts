import { ValidationArguments, ValidationOptions, isUUID, registerDecorator } from "class-validator";

export function ValidateUuid(isOptional:boolean = false, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'validateUuid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    const notEx:boolean = (value === undefined || value === null)
                    if (!isOptional && notEx) return false
                    else if (!notEx && typeof value !== 'string') return false
                    else if (!notEx && !isUUID(value)) return false
                    return true;
                },
                defaultMessage(args: ValidationArguments){
                    return `${args.property} is null or invalid`  
                }
            },
        });
    };
}
