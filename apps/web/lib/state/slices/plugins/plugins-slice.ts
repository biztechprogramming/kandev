import type { StateCreator } from "zustand";
import type { PluginsSlice, PluginsSliceState } from "./types";

export const defaultPluginsState: PluginsSliceState = {
  plugins: { items: [], loading: false, loaded: false, error: null },
};

type ImmerSet = Parameters<
  StateCreator<PluginsSlice, [["zustand/immer", never]], [], PluginsSlice>
>[0];

export const createPluginsSlice: StateCreator<
  PluginsSlice,
  [["zustand/immer", never]],
  [],
  PluginsSlice
> = (set: ImmerSet) => ({
  ...defaultPluginsState,
  setPlugins: (plugins) =>
    set((draft) => {
      draft.plugins.items = plugins;
      draft.plugins.loaded = true;
      draft.plugins.error = null;
    }),
  setPluginsLoading: (loading) =>
    set((draft) => {
      draft.plugins.loading = loading;
    }),
  setPluginsError: (error) =>
    set((draft) => {
      draft.plugins.error = error;
    }),
  upsertPlugin: (plugin) =>
    set((draft) => {
      const idx = draft.plugins.items.findIndex((p) => p.id === plugin.id);
      if (idx >= 0) {
        draft.plugins.items[idx] = plugin;
      } else {
        draft.plugins.items.push(plugin);
      }
    }),
  updatePluginPublisher: (
    id,
    expectedInstallationID,
    expectedVersion,
    publisherIdentity,
    publisherProvenance,
  ) => {
    let applied = false;
    set((draft) => {
      const current = draft.plugins.items.find((plugin) => plugin.id === id);
      if (
        !current ||
        current.installation_id !== expectedInstallationID ||
        current.version !== expectedVersion
      ) {
        return;
      }
      current.publisher_identity = publisherIdentity;
      current.publisher_provenance = publisherProvenance;
      applied = true;
    });
    return applied;
  },
  removePlugin: (id) =>
    set((draft) => {
      draft.plugins.items = draft.plugins.items.filter((p) => p.id !== id);
    }),
});
