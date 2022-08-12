import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialCounterState = {counter: 0, showCounter: true} 

const counterSlice = createSlice({
    name: 'counter',
    initialState: initialCounterState,
    reducers: {
        increment(state) {
            state.counter++;
        },
        increase(state, action) {
            state.counter+=action.payload;
        },
        toggleCounter(state) {
            state.showCounter = !state.showCounter;
        },
        decrement(state) {
            state.counter--;
        }
    }
});

createSlice({
    name: 'authentication',
    
})
const store = configureStore({
    reducer: counterSlice.reducer
});

export const counterActions = counterSlice.actions;

export default store;
