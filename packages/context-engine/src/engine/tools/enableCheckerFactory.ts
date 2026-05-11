import type { LobeToolManifest, PluginEnableChecker, ToolsGenerationContext } from './types';

export interface EnableCheckerConfig {
  /**
   * Whether to allow isExplicitActivation bypass.
   * When true, tools with `context.isExplicitActivation` can be enabled even
   * if they are not in the rules. However, rules that explicitly set a tool
   * to `false` (runtime conditions) are still respected.
   */
  allowExplicitActivation?: boolean;

  /**
   * Platform-specific filter extension point.
   * Return `true` to enable, `false` to disable, or `undefined` to fall through to rules.
   */
  platformFilter?: (params: {
    context?: ToolsGenerationContext;
    manifest: LobeToolManifest;
    pluginId: string;
  }) => boolean | undefined;

  /**
   * Tool-specific enable rules, keyed by pluginId.
   * If a pluginId is present in this map, its value determines whether the tool is enabled.
   * If not present, the tool is disabled by default.
   */
  rules?: Record<string, boolean>;
}

/**
 * Create a unified PluginEnableChecker from declarative configuration.
 *
 * Both frontend and server should use this factory to ensure consistent
 * enable/disable logic. Platform-specific filters can be injected via
 * the `platformFilter` extension point.
 */
export function createEnableChecker(config: EnableCheckerConfig): PluginEnableChecker {
  return ({ pluginId, context, manifest }) => {
    // 1. Platform-specific filter (return undefined = fall through)
    const platformResult = config.platformFilter?.({ context, manifest, pluginId });
    if (platformResult !== undefined) return platformResult;

    // 2. Tool-specific rules
    if (config.rules && pluginId in config.rules) {
      // Rules that explicitly disable a tool (e.g. runtime conditions like
      // canUseDevice=false) are always respected — even during explicit activation.
      return config.rules[pluginId];
    }

    // 3. Explicit activation bypass (e.g. tools activated via lobe-activator)
    // Only applies to tools that have NO explicit rule — allows the activator
    // to enable tools that the user hasn't selected but that aren't blocked
    // by runtime conditions.
    if (config.allowExplicitActivation && context?.isExplicitActivation) return true;

    // 4. Default: disabled (tools must be explicitly enabled via rules)
    return false;
  };
}
