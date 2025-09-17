import "./globals.css";
import Footer from "../components/Footer";
import ShowLogIn from "../components/ShowLogIn";
import NavigationBar from "../components/NavigationBar";


export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
            <NavigationBar />
            {children}
            <Footer />
            <ShowLogIn />
      </body>
    </html>
  )
}
