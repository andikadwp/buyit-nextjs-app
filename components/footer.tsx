import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">ModernShop</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted source for premium electronics and accessories.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?category=Electronics" className="text-muted-foreground hover:text-primary">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/?category=Accessories" className="text-muted-foreground hover:text-primary">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-primary">
                  Track Order
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground">Returns</span>
              </li>
              <li>
                <span className="text-muted-foreground">Shipping Info</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-muted-foreground hover:text-primary">
                  Order History
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ModernShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
