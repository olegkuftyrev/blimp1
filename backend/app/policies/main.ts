/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

export const policies = {
  RestaurantPolicy: () => import('#policies/restaurant_policy'),
  OrderPolicy: () => import('#policies/order_policy'),
  UserPolicy: () => import('#policies/user_policy'),
  KitchenPolicy: () => import('#policies/kitchen_policy'),
  InvitePolicy: () => import('#policies/invite_policy'),
  IdpPolicy: () => import('#policies/idp_policy'),
  PerformancePolicy: () => import('#policies/performance_policy'),
  PlPolicy: () => import('#policies/pl_policy'),
}