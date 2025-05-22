export function DashboardFooter() {
  return (
    <footer className="bg-black dark:bg-white text-white dark:text-black">
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 sm:flex-row sm:gap-6">
            <p className="text-center text-sm leading-loose text-gray-600 dark:text-gray-400">
              Built by{" "}
              <a
                href="https://arceyvargas.com/"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Arce y Vargas
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
