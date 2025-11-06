import create from 'zustand'

type State = {
  selectedFriendIds: string[]
  toggleFriend: (id: string) => void
  setSelected: (ids: string[]) => void
}

export const useStore = create<State>((set) => ({
  selectedFriendIds: [],
  toggleFriend: (id: string) =>
    set((s) => ({
      selectedFriendIds: s.selectedFriendIds.includes(id) ? s.selectedFriendIds.filter((x) => x !== id) : [...s.selectedFriendIds, id],
    })),
  setSelected: (ids: string[]) => set({ selectedFriendIds: ids }),
}))