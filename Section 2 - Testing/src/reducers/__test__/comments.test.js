import commentsReducer from 'reducers/comments';
import { SAVE_COMMENT, FETCH_COMMENTS } from 'actions/types';

it('handles actions of type SAVE_COMMENT', () => {
  const action = {
    type: SAVE_COMMENT,
    payload: 'New Comment'
  };

  const newState = commentsReducer([], action);

  expect(newState).toEqual(['New Comment']);
});

it('handles actions of type FETCH_COMMENTS', () => {
  const action = {
    type: FETCH_COMMENTS,
    payload: { data: [{ name: 'Fetched #1' }, { name: 'Fetched #2' }] }
  };

  const newState = commentsReducer(['Old'], action);

  expect(newState).toEqual(['Old', 'Fetched #1', 'Fetched #2']);
});

it('handles action with unknown type', () => {
  const newState = commentsReducer([], { type: 'LKAFDSJLKAFD' });

  expect(newState).toEqual([]);
});