/**
 * Error message component
 * Displays error alerts to the user
 */
export function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="flex justify-center">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        <p className="font-semibold">Error:</p>
        <p>{message}</p>
      </div>
    </div>
  );
}
