export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200/50 bg-[#F5F5F7]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
            <p className="text-sm text-[#86868B] mb-2">
              Copyright © {new Date().getFullYear()} <b>Visionify Inc.</b> All rights reserved.
            </p>
            <div className="flex items-center gap-4 md:gap-6">
              <a href="/privacy" className="text-sm text-[#86868B] hover:text-[#0066CC] transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-[#86868B] hover:text-[#0066CC] transition-colors">
                Terms
              </a>
              <a href="https://visionify.ai" target="_blank" rel="noopener" className="text-sm text-[#86868B] hover:text-[#0066CC] transition-colors">
                Visionify Website
              </a>
              <a href="https://docs.visionify.ai" target="_blank" rel="noopener" className="text-sm text-[#86868B] hover:text-[#0066CC] transition-colors">
                Visionify Docs
              </a>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <a href="https://visionify.ai" target="_blank" rel="noopener" title="Website" className="text-[#86868B] hover:text-[#0066CC]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-5 w-5 fill-current">
                <path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.4c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64h185.3c2.2 20.4 3.3 41.8 3.3 64m28.8-64h123.1c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64m112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6 78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7 10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5 11.6 26 20.9 58.2 27 94.7m-209 0H18.6c30-74.1 93.6-130.9 172-151.6-25.5 34.2-45.3 87.7-55.3 151.6M8.1 192h123.1c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64m186.6 254.6c-11.6-26-20.9-58.2-27-94.6h176.6c-6.1 36.4-15.5 68.6-27 94.6-10.5 23.6-22.2 40.7-33.5 51.5-11.2 10.7-20.5 13.9-27.8 13.9s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6-78.4-20.7-142-77.5-172-151.6zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6 25.5-34.2 45.2-87.7 55.3-151.6h116.7z"></path>
              </svg>
            </a>
            
            <a href="https://twitter.com/visionify" target="_blank" rel="noopener" title="Twitter" className="text-[#86868B] hover:text-[#0066CC]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-5 w-5 fill-current">
                <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253"></path>
              </svg>
            </a>
            
            <a href="https://www.linkedin.com/company/visionify-ai/" target="_blank" rel="noopener" title="LinkedIn" className="text-[#86868B] hover:text-[#0066CC]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-5 w-5 fill-current">
                <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3M447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
