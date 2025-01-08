import useSSE from "./useSSE";

function App() {
  const { data, error } = useSSE("http://localhost:3000/events");

  return (
    <div>
      <h1>Server-Sent Events in React</h1>
      {error && <p>{error}</p>}
      {data ? (
        <p>Message from server: {data?.data}</p>
      ) : (
        <p>Waiting for updates...</p>
      )}
    </div>
  );
}

export default App;
