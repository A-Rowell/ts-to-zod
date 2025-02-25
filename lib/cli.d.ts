import { Command, flags } from "@oclif/command";
import { OutputFlags } from "@oclif/parser";
import { Config, TsToZodConfig } from "./config";
declare class TsToZod extends Command {
    static description: string;
    static usage: string[] | undefined;
    static flags: {
        version: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        keepComments: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        init: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        skipParseJSDoc: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        skipValidation: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        inferredTypes: flags.IOptionFlag<string | undefined>;
        watch: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        config: flags.IOptionFlag<string>;
        all: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    static args: {
        name: string;
        description: string;
    }[];
    run(): Promise<void>;
    /**
     * Generate on zod schema file.
     * @param args
     * @param fileConfig
     * @param flags
     */
    generate(args: {
        input?: string;
        output?: string;
    }, fileConfig: Config | undefined, flags: OutputFlags<typeof TsToZod.flags>): Promise<{
        success: true;
    } | {
        success: false;
        error: string;
    }>;
    /**
     * Load user config from `ts-to-zod.config.c?js`
     */
    loadFileConfig(config: TsToZodConfig | undefined, flags: OutputFlags<typeof TsToZod.flags>): Promise<TsToZodConfig | undefined>;
}
export = TsToZod;
