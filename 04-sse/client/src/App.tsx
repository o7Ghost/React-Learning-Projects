import { useEffect } from "react";
import useSSE from "./useSSE";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";

function App() {
  const { data, error } = useSSE("http://localhost:3000/events");

  useEffect(() => {
    toast(data?.data);
  }, [data]);
  return (
    <div>
      <h1>Server-Sent Events in React</h1>
      {error && <p>{error}</p>}
      <ToastContainer />
      {data ? (
        <p>Message from server: {data?.data}</p>
      ) : (
        <p>Waiting for updates...</p>
      )}
    </div>
  );
}

export default App;
