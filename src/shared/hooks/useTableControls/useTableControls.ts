import { useCallback, useReducer } from "react";
import { ActionType, createAction, getType } from "typesafe-actions";
import {
  IExtraColumnData,
  ISortBy,
  SortByDirection,
} from "@patternfly/react-table";

import { PageQuery, SortByQuery } from "api/models";

interface PaginationAction {
  page: number;
  perPage?: number;
}

interface SortAction {
  index: number;
  direction: "asc" | "desc";
}

// Actions

const setPagination = createAction(
  "tableControls/pagination/change"
)<PaginationAction>();

const setSortBy = createAction("tableControls/sortBy/change")<SortAction>();

// State
type State = Readonly<{
  changed: boolean;

  paginationQuery: PageQuery;
  sortByQuery?: SortByQuery;
}>;

const defaultState: State = {
  changed: false,

  paginationQuery: {
    page: 1,
    perPage: 10,
  },
  sortByQuery: undefined,
};

// Reducer

type Action = ActionType<typeof setSortBy | typeof setPagination>;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case getType(setPagination):
      return {
        ...state,
        changed: true,
        paginationQuery: {
          page: action.payload.page,
          perPage: action.payload.perPage
            ? action.payload.perPage
            : state.paginationQuery.perPage,
        },
      };
    case getType(setSortBy):
      return {
        ...state,
        changed: true,
        sortByQuery: {
          index: action.payload.index,
          direction: action.payload.direction,
        },
      };
    default:
      return state;
  }
};

// Hook

interface HookArgs {
  paginationQuery?: PageQuery;
  sortByQuery?: SortByQuery;
}

interface HookState {
  paginationQuery: PageQuery;
  sortByQuery?: SortByQuery;
  handlePaginationChange: (pagination: PaginationAction) => void;
  handleSortChange: (
    event: React.MouseEvent,
    index: number,
    direction: SortByDirection,
    extraData: IExtraColumnData
  ) => void;
}

export const useTableControls = ({
  paginationQuery,
  sortByQuery,
}: HookArgs): HookState => {
  const [state, dispatch] = useReducer(reducer, {
    ...defaultState,
    ...paginationQuery,
    ...sortByQuery,
  });

  const handlePaginationChange = useCallback((pagination: PaginationAction) => {
    dispatch(setPagination(pagination));
  }, []);

  const handleSortChange = useCallback(
    (
      event: React.MouseEvent,
      index: number,
      direction: SortByDirection,
      extraData: IExtraColumnData
    ) => {
      dispatch(
        setSortBy({
          index: index,
          direction: direction,
        })
      );
    },
    []
  );

  return {
    paginationQuery: state.paginationQuery,
    sortByQuery: state.sortByQuery,
    handlePaginationChange,
    handleSortChange,
  };
};
