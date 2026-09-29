import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// JSDOM bundled with react-scripts lacks these; React Router v7 needs them
Object.assign(global, { TextEncoder, TextDecoder });
