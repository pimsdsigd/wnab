import morgan from "morgan";
import {Logging} from "@damntools.fr/logger-simple";

export default function morganMiddleware() {

    const pattern = ":method :url :status :res[content-length] - :response-time ms"

    const Logger = Logging.getHttpLogger("Morgan")

    const stream = {
        write: (message: string) => Logger.http(message),
    };

    const skip = () => {
        const env = process.env.NODE_ENV || "development";
        return env !== "development";
    };

    return morgan(
        pattern,
        {stream, skip}
    );
}