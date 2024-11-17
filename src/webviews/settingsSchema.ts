// TODO: update dynamically from https://raw.githubusercontent.com/jdx/mise/refs/heads/main/schema/mise.json
export const settingsSchema = {
	properties: {
		activate_aggressive: {
			description:
				"Pushes tools' bin-paths to the front of PATH instead of allowing modifications of PATH after activation to take precedence.",
			type: "boolean",
		},
		all_compile: {
			description: "do not use precompiled binaries for any tool",
			type: "boolean",
		},
		always_keep_download: {
			description: "should mise keep downloaded files after installation",
			type: "boolean",
		},
		always_keep_install: {
			description:
				"should mise keep install files after installation even if the installation fails",
			type: "boolean",
		},
		aqua_registry_url: {
			description: "URL to fetch aqua registry from.",
			type: "string",
		},
		asdf: {
			description: "use asdf as a default plugin backend",
			deprecated: "Use disable_backends instead.",
			type: "boolean",
		},
		asdf_compat: {
			description:
				"set to true to ensure .tool-versions will be compatible with asdf",
			type: "boolean",
		},
		cache_prune_age: {
			default: "30d",
			description:
				"Delete files in cache that have not been accessed in this duration",
			type: "string",
		},
		cargo: {
			additionalProperties: false,
			properties: {
				binstall: {
					default: true,
					description:
						"Use cargo-binstall instead of cargo install if available",
					type: "boolean",
				},
			},
		},
		cargo_binstall: {
			description: "Use cargo-binstall instead of cargo install if available",
			type: "boolean",
		},
		cd: {
			description: "Path to change to after launching mise",
			type: "string",
		},
		ci: {
			description: "Set to true if running in a CI environment",
			type: "boolean",
		},
		color: {
			default: true,
			description: "Use color in mise terminal output",
			type: "boolean",
		},
		debug: {
			description: "Sets log level to debug",
			type: "boolean",
		},
		disable_backends: {
			default: [],
			description: "Backends to disable such as `asdf` or `pipx`",
			type: "array",
			items: {
				type: "string",
			},
		},
		disable_default_registry: {
			description:
				"Disable the default mapping of short tool names like `go` -> `vfox:version-fox/vfox-golang`",
			type: "boolean",
		},
		disable_default_shorthands: {
			description: "Disables built-in shorthands to asdf/vfox plugins",
			deprecated: "Replaced with `disable_default_registry`",
			type: "boolean",
		},
		disable_hints: {
			default: [],
			description: "Turns off helpful hints when using different mise features",
			type: "array",
			items: {
				type: "string",
			},
		},
		disable_tools: {
			default: [],
			description: "Tools defined in mise.toml that should be ignored",
			type: "array",
			items: {
				type: "string",
			},
		},
		env_file: {
			description: "Path to a file containing environment variables.",
			type: "string",
		},
		experimental: {
			description:
				"Enable experimental mise features which are incomplete or unstable—breakings changes may occur",
			type: "boolean",
		},
		fetch_remote_versions_cache: {
			default: "1h",
			description: "How long to cache remote versions for tools.",
			type: "string",
		},
		fetch_remote_versions_timeout: {
			default: "10s",
			description:
				"Timeout in seconds for HTTP requests to fetch new tool versions in mise.",
			type: "string",
		},
		go_default_packages_file: {
			default: "~/.default-go-packages",
			description:
				"Path to a file containing default go packages to install when installing go",
			type: "string",
		},
		go_download_mirror: {
			default: "https://dl.google.com/go",
			description: "Mirror to download go sdk tarballs from.",
			type: "string",
		},
		go_repo: {
			default: "https://github.com/golang/go",
			description: "URL to fetch go from.",
			type: "string",
		},
		go_set_gobin: {
			description: "Changes where `go install` installs binaries to.",
			type: "boolean",
		},
		go_set_gopath: {
			description:
				"[deprecated] Set to true to set GOPATH=~/.local/share/mise/installs/go/.../packages.",
			deprecated: "Use env._go.set_goroot instead.",
			type: "boolean",
		},
		go_set_goroot: {
			default: true,
			description: "Sets GOROOT=~/.local/share/mise/installs/go/.../.",
			type: "boolean",
		},
		go_skip_checksum: {
			description:
				"Set to true to skip checksum verification when downloading go sdk tarballs.",
			type: "boolean",
		},
		http_timeout: {
			default: "30s",
			description: "Timeout in seconds for all HTTP requests in mise.",
			type: "string",
		},
		jobs: {
			default: 4,
			description: "How many jobs to run concurrently such as tool installs.",
			type: "number",
		},
		legacy_version_file: {
			default: true,
			description:
				"Set to false to disable the idiomatic version files such as .node-version, .ruby-version, etc.",
			type: "boolean",
		},
		legacy_version_file_disable_tools: {
			default: [],
			description: "Specific tools to disable idiomatic version files for.",
			type: "array",
			items: {
				type: "string",
			},
		},
		libgit2: {
			default: true,
			description:
				"Use libgit2 for git operations, set to false to shell out to git.",
			type: "boolean",
		},
		lockfile: {
			default: false,
			description: "Create and read lockfiles for tool versions.",
			type: "boolean",
		},
		log_level: {
			default: "info",
			description: "Show more/less output.",
			type: "string",
			enum: ["trace", "debug", "info", "warn", "error"],
		},
		node: {
			additionalProperties: false,
			properties: {
				compile: {
					description: "Compile node from source.",
					type: "boolean",
				},
				flavor: {
					description:
						"Install a specific node flavor like glibc-217 or musl. Use with unofficial node build repo.",
					type: "string",
				},
				mirror_url: {
					description: "Mirror to download node tarballs from.",
					type: "string",
				},
			},
		},
		not_found_auto_install: {
			default: true,
			description:
				'Set to false to disable the "command not found" handler to autoinstall missing tool versions.',
			type: "boolean",
		},
		npm: {
			additionalProperties: false,
			properties: {
				bun: {
					description:
						"Use bun instead of npm if bun is installed and on PATH.",
					type: "boolean",
				},
			},
		},
		paranoid: {
			description: "Enables extra-secure behavior.",
			type: "boolean",
		},
		pin: {
			description:
				"Default to pinning versions when running `mise use` in mise.toml files.",
			type: "boolean",
		},
		pipx: {
			additionalProperties: false,
			properties: {
				uvx: {
					description:
						"Use uvx instead of pipx if uv is installed and on PATH.",
					type: "boolean",
				},
			},
		},
		pipx_uvx: {
			description: "Use uvx instead of pipx if uv is installed and on PATH.",
			type: "boolean",
		},
		plugin_autoupdate_last_check_duration: {
			default: "7d",
			description:
				"How long to wait before updating plugins automatically (note this isn't currently implemented).",
			type: "string",
		},
		profile: {
			description: "Profile to use for mise.${MISE_PROFILE}.toml files.",
			type: "string",
		},
		python: {
			additionalProperties: false,
			properties: {
				compile: {
					description:
						"If true, compile python from source. If false, use precompiled binaries. If not set, use precompiled binaries if available.",
					type: "boolean",
				},
				default_packages_file: {
					description:
						"Path to a file containing default python packages to install when installing a python version.",
					type: "string",
				},
				patch_url: {
					description:
						"URL to fetch python patches from to pass to python-build.",
					type: "string",
				},
				patches_directory: {
					description: "Directory to fetch python patches from.",
					type: "string",
				},
				precompiled_arch: {
					description:
						"Specify the architecture to use for precompiled binaries.",
					type: "string",
				},
				precompiled_os: {
					description: "Specify the OS to use for precompiled binaries.",
					type: "string",
				},
				pyenv_repo: {
					default: "https://github.com/pyenv/pyenv.git",
					description:
						"URL to fetch pyenv from for compiling python with python-build.",
					type: "string",
				},
				venv_auto_create: {
					description: "Automatically create virtualenvs for python tools.",
					deprecated: "Use env._python.venv instead.",
					type: "boolean",
				},
				venv_stdlib: {
					description: "Prefer to use venv from Python's standard library.",
					type: "boolean",
				},
			},
		},
		python_compile: {
			description:
				"If true, compile python from source. If false, use precompiled binaries. If not set, use precompiled binaries if available.",
			deprecated: "Use python.compile instead.",
			type: "boolean",
		},
		python_default_packages_file: {
			description:
				"Path to a file containing default python packages to install when installing python.",
			deprecated: "Use python.default_packages_file instead.",
			type: "string",
		},
		python_patch_url: {
			description: "URL to fetch python patches from.",
			deprecated: "Use python.patch_url instead.",
			type: "string",
		},
		python_patches_directory: {
			description: "Directory to fetch python patches from.",
			deprecated: "Use python.patch_url instead.",
			type: "string",
		},
		python_precompiled_arch: {
			description: "Specify the architecture to use for precompiled binaries.",
			deprecated: "Use python.precompiled_arch instead.",
			type: "string",
		},
		python_precompiled_os: {
			description: "Specify the OS to use for precompiled binaries.",
			deprecated: "Use python.precompiled_os instead.",
			type: "string",
		},
		python_pyenv_repo: {
			description: "URL to fetch pyenv from for compiling python.",
			deprecated: "Use python.pyenv_repo instead.",
			type: "string",
		},
		python_venv_auto_create: {
			description: "Automatically create virtualenvs for python tools.",
			deprecated: "Use env._python.venv instead.",
			type: "boolean",
		},
		python_venv_stdlib: {
			description: "Prefer to use venv from Python's standard library.",
			deprecated: "Use python.venv_stdlib instead.",
			type: "boolean",
		},
		quiet: {
			description: "Suppress all output except errors.",
			type: "boolean",
		},
		raw: {
			description: "Connect stdin/stdout/stderr to child processes.",
			type: "boolean",
		},
		ruby: {
			additionalProperties: false,
			properties: {
				apply_patches: {
					description: "A list of patch files or URLs to apply to ruby source.",
					type: "string",
				},
				default_packages_file: {
					default: "~/.default-gems",
					description:
						"Path to a file containing default ruby gems to install when installing ruby.",
					type: "string",
				},
				ruby_build_opts: {
					description: "Options to pass to ruby-build.",
					type: "string",
				},
				ruby_build_repo: {
					default: "https://github.com/rbenv/ruby-build.git",
					description: "URL to fetch ruby-build from.",
					type: "string",
				},
				ruby_install: {
					description: "Use ruby-install instead of ruby-build.",
					type: "boolean",
				},
				ruby_install_opts: {
					description: "Options to pass to ruby-install.",
					type: "string",
				},
				ruby_install_repo: {
					default: "https://github.com/postmodern/ruby-install.git",
					description: "URL to fetch ruby-install from.",
					type: "string",
				},
				verbose_install: {
					description:
						"Set to true to enable verbose output during ruby installation.",
					type: "boolean",
				},
			},
		},
		shorthands_file: {
			description: "Path to a file containing custom tool shorthands.",
			type: "string",
		},
		status: {
			additionalProperties: false,
			properties: {
				missing_tools: {
					default: "if_other_versions_installed",
					description:
						"Show a warning if tools are not installed when entering a directory with a mise.toml file.",
					type: "string",
				},
				show_env: {
					description:
						"Show configured env vars when entering a directory with a mise.toml file.",
					type: "boolean",
				},
				show_tools: {
					description:
						"Show configured env vars when entering a directory with a mise.toml file.",
					type: "boolean",
				},
			},
		},
		task_output: {
			description: "Change output style when executing tasks.",
			type: "string",
			enum: ["prefix", "interleave"],
		},
		task_timings: {
			description:
				"Show completion message with elapsed time for each task on `mise run`.",
			type: "boolean",
		},
		trace: {
			description: "Sets log level to trace",
			type: "boolean",
		},
		trusted_config_paths: {
			default: [],
			description:
				"This is a list of config paths that mise will automatically mark as trusted.",
			type: "array",
			items: {
				type: "string",
			},
		},
		unix_default_file_shell_args: {
			default: ["sh"],
			description:
				"List of default shell arguments for unix to be used with `file`. For example `sh`.",
			type: "array",
			items: {
				type: "string",
			},
		},
		unix_default_inline_shell_args: {
			default: ["sh", "-c"],
			description:
				"List of default shell arguments for unix to be used with inline commands. For example, `sh`, `-c` for sh.",
			type: "array",
			items: {
				type: "string",
			},
		},
		use_file_shell_for_executable_tasks: {
			default: false,
			description:
				"Determines whether to use a specified shell for executing tasks in the tasks directory. When set to true, the shell defined in the file will be used, or the default shell specified by `windows_default_file_shell_args` or `unix_default_file_shell_args` will be applied. If set to false, tasks will be executed directly as programs.",
			type: "boolean",
		},
		use_versions_host: {
			default: true,
			description:
				"Set to false to disable using the mise-versions API as a quick way for mise to query for new versions.",
			type: "boolean",
		},
		verbose: {
			description:
				"Shows more verbose output such as installation logs when installing tools.",
			type: "boolean",
		},
		vfox: {
			description: "Use vfox as a default plugin backend instead of asdf.",
			deprecated: "Use disable_backends instead.",
			type: "boolean",
		},
		windows_default_file_shell_args: {
			default: ["cmd", "/c"],
			description:
				"List of default shell arguments for Windows to be used for file commands. For example, `cmd`, `/c` for cmd.exe.",
			type: "array",
			items: {
				type: "string",
			},
		},
		windows_default_inline_shell_args: {
			default: ["cmd", "/c"],
			description:
				"List of default shell arguments for Windows to be used for inline commands. For example, `cmd`, `/c` for cmd.exe.",
			type: "array",
			items: {
				type: "string",
			},
		},
		windows_executable_extensions: {
			default: ["exe", "bat", "cmd", "com", "ps1", "vbs"],
			description:
				"List of executable extensions for Windows. For example, `exe` for .exe files, `bat` for .bat files, and so on.",
			type: "array",
			items: {
				type: "string",
			},
		},
		yes: {
			description:
				"This will automatically answer yes or no to prompts. This is useful for scripting.",
			type: "boolean",
		},
	},
};

type FlattenedProperty = {
	key: string;
	type: string;
	description: string | undefined;
	defaultValue: unknown;
	deprecated?: string;
};

type PropertyValue = {
	type?: string;
	description?: string;
	default?: unknown;
	deprecated?: string;
	items?: { type: string };
	enum?: string[];
	properties?: Record<string, PropertyValue>;
};

type SchemaType = {
	properties: Record<string, PropertyValue>;
};

export function flattenJsonSchema(
	schema: SchemaType,
	parentKey = "",
	result: FlattenedProperty[] = [],
): FlattenedProperty[] {
	if (!schema.properties) {
		return result;
	}

	for (const [key, value] of Object.entries(schema.properties)) {
		const currentKey = parentKey ? `${parentKey}.${key}` : key;

		if (value.properties) {
			flattenJsonSchema({ properties: value.properties }, currentKey, result);
		} else {
			let propertyType = value.type;

			if (value.type === "array" && value.items) {
				propertyType = `${value.items.type}[]`;
			}

			if (value.enum) {
				propertyType = value.enum.map((v) => `"${v}"`).join(" | ");
			}

			result.push({
				key: currentKey,
				type: propertyType ?? "string",
				description: value.description,
				defaultValue: value.default,
				...(value.deprecated && { deprecated: value.deprecated }),
			});
		}
	}

	return result;
}

export const flattenedSettingsSchema = flattenJsonSchema(settingsSchema);

export function getDefaultForType(type?: string): unknown {
	switch (type) {
		case "string":
			return "";
		case "boolean":
			return false;
		case "number":
			return 0;
		case "object":
			return {};
		case "array":
			return [];
		default:
			return "";
	}
}
