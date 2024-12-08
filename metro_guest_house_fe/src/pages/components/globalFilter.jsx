export default function GlobalFilter({ filter, setFilter }) {
  return (
    <span className="text-xl text-center">
      search:{" "}
      <input
        className="m-2 outline-none border-2 border-green-600 rounded-md p-2"
        value={filter || " "}
        onChange={(e) => setFilter(e.target.value)}
      />
    </span>
  );
}
