export interface RouteConfig {
  path: string;
  name: string;
  isTopLevel?: boolean;
  children?: RouteConfig[];
}

export const routeConfig: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    isTopLevel: true
  },
  {
    path: '/registration',
    name: 'Registration',
    isTopLevel: true
  },
  {
    path: '/registration/step1',
    name: 'Registration - Step 1'
  },
  {
    path: '/registration/step2',
    name: 'Registration - Step 2'
  },
  {
    path: '/registration/step3',
    name: 'Registration - Step 3'
  },
  {
    path: '/sales',
    name: 'Sales',
    isTopLevel: true
  },
  {
    path: '/sales/salesstep1',
    name: 'Sales - Step 1'
  },
  {
    path: '/sales/salesstep2',
    name: 'Sales - Step 2'
  },
  {
    path: '/sales/salesstep3',
    name: 'Sales - Step 3'
  },
  {
    path: '/sales/refunds',
    name: 'Refunds'
  },
  {
    path: '/sales/refunds/refundsstep1',
    name: 'Refunds - Step 1'
  },
  {
    path: '/sales/refunds/refundsstep2',
    name: 'Refunds - Step 2'
  },
  {
    path: '/sales/refunds/refundsstep3',
    name: 'Refunds - Step 3'
  },
  {
    path: '/sales/refunds/refundsstep4',
    name: 'Refunds - Step 4'
  },
  {
    path: '/checkout',
    name: 'Checkout',
    isTopLevel: true
  },
  {
    path: '/checkout/step1',
    name: 'Checkout - Step 1'
  },
  {
    path: '/checkout/step2',
    name: 'Checkout - Step 2'
  },
  {
    path: '/checkout/step3',
    name: 'Checkout - Step 3'
  },
  {
    path: '/admin',
    name: 'Admin Panel',
    isTopLevel: true,
    children: [
      {
        path: '/admin',
        name: 'Dashboard',
        isTopLevel: true
      },
      {
        path: '/admin/dashboard',
        name: 'Dashboard',
        isTopLevel: true
      },
      {
        path: '/admin/users',
        name: 'Users',
        isTopLevel: true
      },
      {
        path: '/admin/users/add',
        name: 'Add User'
      },
      {
        path: '/admin/users/addUser',
        name: 'Add User'
      },
      {
        path: '/admin/users/role/:id',
        name: 'Update User Role'
      },
      {
        path: '/admin/users/userdetails/:id',
        name: 'User Details'
      },
      {
        path: '/admin/stalls',
        name: 'Stalls',
        isTopLevel: true
      },
      {
        path: '/admin/stalls/add',
        name: 'Add Stall'
      },
      {
        path: '/admin/stalls/stalldetails/:id',
        name: 'Stall Details'
      },
      {
        path: '/admin/stalls/stalldetails/:id/operators',
        name: 'Stall Operators'
      },
      {
        path: '/admin/stalls/stalldetails/:id/stats',
        name: 'Stall Statistics'
      },
      {
        path: '/admin/customers',
        name: 'Customers',
        isTopLevel: true
      },
      {
        path: '/admin/customers/create',
        name: 'Create Customers'
      },
      {
        path: '/admin/customers/customerdetails/:id',
        name: 'Customer Details'
      },
      {
        path: '/admin/customers/reissue-qr-screen/:id',
        name: 'Reissue QR Code'
      },
      {
        path: '/admin/customers/reissue-qr/:id',
        name: 'Confirm QR Reissue'
      },
      {
        path: '/admin/qrcodes',
        name: 'QR Codes',
        isTopLevel: true
      },
      {
        path: '/admin/qrcodes/generate',
        name: 'Generate QR Codes'
      },
      {
        path: '/admin/qrcodes/batches',
        name: 'QR Code Batches'
      },
      {
        path: '/admin/qrcodes/batches/batchdetails/:id',
        name: 'Batch Details'
      },
      {
        path: '/admin/qrcodes/batches/create',
        name: 'Create Batch'
      }
    ]
  },
  // Tutorial Routes
  {
    path: '/tutorial/sales',
    name: 'Tutorial - Sales',
    isTopLevel: true
  },
  {
    path: '/tutorial/sales/step1',
    name: 'Tutorial - Sales Step 1'
  },
  {
    path: '/tutorial/sales/step2',
    name: 'Tutorial - Sales Step 2'
  },
  {
    path: '/tutorial/sales/step3',
    name: 'Tutorial - Sales Step 3'
  },
  {
    path: '/tutorial/sales/complete',
    name: 'Tutorial - Sales Complete'
  },
  {
    path: '/tutorial/refunds',
    name: 'Tutorial - Refunds',
    isTopLevel: true
  },
  {
    path: '/tutorial/refunds/step1',
    name: 'Tutorial - Refunds Step 1'
  },
  {
    path: '/tutorial/refunds/step2',
    name: 'Tutorial - Refunds Step 2'
  },
  {
    path: '/tutorial/refunds/step3',
    name: 'Tutorial - Refunds Step 3'
  },
  {
    path: '/tutorial/refunds/step4',
    name: 'Tutorial - Refunds Step 4'
  },
  {
    path: '/tutorial/refunds/complete',
    name: 'Tutorial - Refunds Complete'
  },
  {
    path: '/tutorial/checkout',
    name: 'Tutorial - Checkout',
    isTopLevel: true
  },
  {
    path: '/tutorial/checkout/step1',
    name: 'Tutorial - Checkout Step 1'
  },
  {
    path: '/tutorial/checkout/step2',
    name: 'Tutorial - Checkout Step 2'
  },
  {
    path: '/tutorial/checkout/step3',
    name: 'Tutorial - Checkout Step 3'
  },
  {
    path: '/tutorial/registration',
    name: 'Tutorial - Registration',
    isTopLevel: true
  },
  {
    path: '/tutorial/registration/step1',
    name: 'Tutorial - Registration Step 1'
  },
  {
    path: '/tutorial/registration/step2',
    name: 'Tutorial - Registration Step 2'
  },
  {
    path: '/tutorial/registration/step3',
    name: 'Tutorial - Registration Step 3'
  },
  {
    path: '/tutorial/registration/complete',
    name: 'Tutorial - Registration Complete'
  },
  {
    path: '/tutorial/checkout',
    name: 'Tutorial - Checkout',
    isTopLevel: true
  },
  {
    path: '/tutorial/checkout/step1',
    name: 'Tutorial - Checkout Step 1'
  },
  {
    path: '/tutorial/checkout/step2',
    name: 'Tutorial - Checkout Step 2'
  },
  {
    path: '/tutorial/checkout/step3',
    name: 'Tutorial - Checkout Step 3'
  },
  {
    path: '/tutorial/checkout/complete',
    name: 'Tutorial - Checkout Complete'
  }
];

// Helper function to find route name by path
export function getRouteNameByPath(pathname: string): string {
  // First, try to find exact match
  const findRoute = (routes: RouteConfig[], path: string): string | null => {
    for (const route of routes) {
      if (route.path === path) {
        return route.name;
      }
      if (route.children) {
        const childResult = findRoute(route.children, path);
        if (childResult) return childResult;
      }
    }
    return null;
  };

  let routeName = findRoute(routeConfig, pathname);
  
  // If no exact match, try to match with parameters (e.g., /admin/users/userdetails/123)
  if (!routeName) {
    const findRouteWithParams = (routes: RouteConfig[], path: string): string | null => {
      for (const route of routes) {
        // Convert route path with parameters to regex
        const routeRegex = new RegExp(
          '^' + route.path.replace(/:[^/]+/g, '[^/]+') + '$'
        );
        if (routeRegex.test(path)) {
          return route.name;
        }
        if (route.children) {
          const childResult = findRouteWithParams(route.children, path);
          if (childResult) return childResult;
        }
      }
      return null;
    };
    
    routeName = findRouteWithParams(routeConfig, pathname);
  }
  
  return routeName || 'PayPoint';
}

// Helper function to determine if current route should show back button
export function shouldShowBackButton(pathname: string): boolean {
  // First, try to find exact match
  const findRoute = (routes: RouteConfig[], path: string): RouteConfig | null => {
    for (const route of routes) {
      if (route.path === path) {
        return route;
      }
      if (route.children) {
        const childResult = findRoute(route.children, path);
        if (childResult) return childResult;
      }
    }
    return null;
  };

  let route = findRoute(routeConfig, pathname);
  
  // If no exact match, try to match with parameters (e.g., /admin/users/userdetails/123)
  if (!route) {
    const findRouteWithParams = (routes: RouteConfig[], path: string): RouteConfig | null => {
      for (const routeItem of routes) {
        // Convert route path with parameters to regex
        const routeRegex = new RegExp(
          '^' + routeItem.path.replace(/:[^/]+/g, '[^/]+') + '$'
        );
        if (routeRegex.test(path)) {
          return routeItem;
        }
        if (routeItem.children) {
          const childResult = findRouteWithParams(routeItem.children, path);
          if (childResult) return childResult;
        }
      }
      return null;
    };
    
    route = findRouteWithParams(routeConfig, pathname);
  }
  
  // Show back button if route is not marked as top level
  return route ? !route.isTopLevel : false;
}