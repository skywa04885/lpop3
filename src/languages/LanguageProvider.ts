import { Dutch } from "./Dutch";
import { English } from "./English";
import { Language, LanguageName } from "./Language";

export function get_language(name: LanguageName): Language | null {
    switch (name) {
    case LanguageName.English:
        return English;
    case LanguageName.Dutch:
        return Dutch;
    default:
        return null;
    }
}