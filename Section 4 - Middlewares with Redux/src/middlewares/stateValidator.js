import Ajv from "ajv";
import stateSchema from "middlewares/stateSchema";

const ajv = new Ajv();
const validate = ajv.compile(stateSchema);

const stateValidator = ({ getState }) => (next) => (action) => {
    // Let the action reach the reducers first, then check the resulting state
    const result = next(action);

    if (!validate(getState())) {
        console.warn("Invalid state schema detected", validate.errors);
    }

    return result;
};

export default stateValidator;
