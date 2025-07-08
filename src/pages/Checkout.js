import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteItemFromCartAsync,
  selectItems,
  updateCartAsync,
} from "../features/cart/cartSlice";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { updateUserAsync } from "../features/user/userSlice";
import { useState } from "react";
import {
  createOrderAsync,
  selectCurrentOrder,
  selectStatus,
} from "../features/order/orderSlice";
import { selectUserInfo } from "../features/user/userSlice";
import { Grid } from "react-loader-spinner";

function Checkout() {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const user = useSelector(selectUserInfo);
  const items = useSelector(selectItems);
  const status = useSelector(selectStatus);
  const currentOrder = useSelector(selectCurrentOrder);

  const totalAmount = items.reduce(
    (amount, item) => item.product.discountPrice * item.quantity + amount,
    0
  );
  const totalItems = items.reduce((total, item) => item.quantity + total, 0);

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const handleQuantity = (e, item) => {
    dispatch(updateCartAsync({ id: item.id, quantity: +e.target.value }));
  };

  const handleRemove = (e, id) => {
    dispatch(deleteItemFromCartAsync(id));
  };

  const handleAddress = (e) => {
    console.log(e.target.value);
    setSelectedAddress(user.addresses[e.target.value]);
  };

  const handlePayment = (e) => {
    console.log(e.target.value);
    setPaymentMethod(e.target.value);
  };

  const handleOrder = (e) => {
    if (selectedAddress && paymentMethod) {
      const order = {
        items,
        totalAmount,
        totalItems,
        user: user.id,
        paymentMethod,
        selectedAddress,
        status: "pending",
        // productOwner // other status can be delivered, received.
      };
      dispatch(createOrderAsync(order));
      // need to redirect from here to a new page of order success.
    } else {
      alert("Enter Address and Payment method");
    }
  };

  return (
    <>
      {!items.length && <Navigate to="/" replace={true}></Navigate>}
      {currentOrder && currentOrder.paymentMethod === "cash" && (
        <Navigate
          to={`/order-success/${currentOrder.id}`}
          replace={true}
        ></Navigate>
      )}
      {currentOrder && currentOrder.paymentMethod === "card" && (
        <Navigate to={`/razor-checkout/`} replace={true}></Navigate>
      )}

      {status === "loading" ? (
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {/* This form is for address */}
              <form
                className="bg-white px-5 py-12 mt-12"
                noValidate
                onSubmit={handleSubmit((data) => {
                  console.log(data);
                  dispatch(
                    updateUserAsync({
                      ...user,
                      addresses: [...user.addresses, data],
                    })
                  );
                  reset();
                })}
              >
                {/* --- Personal Info Section --- */}
                <div className="space-y-12">
                  <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-2xl font-semibold leading-7 text-gray-900">
                      Personal Information
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Use a permanent address where you can receive mail.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      {/* Name */}
                      <div className="sm:col-span-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Full name
                        </label>
                        <input
                          id="name"
                          type="text"
                          {...register("name", {
                            required: "Name is required",
                            minLength: {
                              value: 2,
                              message: "Name must be at least 2 characters",
                            },
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.name && (
                          <p className="text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="sm:col-span-4">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Enter a valid email address",
                            },
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.email && (
                          <p className="text-red-500">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Phone
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          {...register("phone", {
                            required: "Phone number is required",
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: "Phone number must be 10 digits",
                            },
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.phone && (
                          <p className="text-red-500">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* Street */}
                      <div className="col-span-full">
                        <label
                          htmlFor="street"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Street address
                        </label>
                        <input
                          id="street"
                          type="text"
                          {...register("street", {
                            required: "Street address is required",
                            minLength: {
                              value: 5,
                              message: "Enter a valid street address",
                            },
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.street && (
                          <p className="text-red-500">
                            {errors.street.message}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div className="sm:col-span-2 sm:col-start-1">
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-900"
                        >
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          {...register("city", {
                            required: "City is required",
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.city && (
                          <p className="text-red-500">{errors.city.message}</p>
                        )}
                      </div>

                      {/* State */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-900"
                        >
                          State / Province
                        </label>
                        <input
                          id="state"
                          type="text"
                          {...register("state", {
                            required: "State is required",
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.state && (
                          <p className="text-red-500">{errors.state.message}</p>
                        )}
                      </div>

                      {/* ZIP Code */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="pinCode"
                          className="block text-sm font-medium text-gray-900"
                        >
                          ZIP / Postal code
                        </label>
                        <input
                          id="pinCode"
                          type="text"
                          {...register("pinCode", {
                            required: "ZIP code is required",
                            pattern: {
                              value: /^[0-9]{5,6}$/,
                              message: "ZIP code must be 5 or 6 digits",
                            },
                          })}
                          className="mt-2 block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                        />
                        {errors.pinCode && (
                          <p className="text-red-500">
                            {errors.pinCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="text-sm font-semibold leading-6 text-gray-900"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      Add Address
                    </button>
                  </div>
                </div>
              </form>

              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Addresses
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Choose from Existing addresses
                </p>
                <ul>
                  {user.addresses.map((address, index) => (
                    <li
                      key={index}
                      className="flex justify-between gap-x-6 px-5 py-5 border-solid border-2 border-gray-200"
                    >
                      <div className="flex gap-x-4">
                        <input
                          onChange={handleAddress}
                          name="address"
                          type="radio"
                          value={index}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-gray-900">
                            {address.name}
                          </p>
                          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                            {address.street}
                          </p>
                          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                            {address.pinCode}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm leading-6 text-gray-900">
                          Phone: {address.phone}
                        </p>
                        <p className="text-sm leading-6 text-gray-500">
                          {address.city}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 space-y-10">
                  <fieldset>
                    <legend className="text-sm font-semibold leading-6 text-gray-900">
                      Payment Methods
                    </legend>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Choose One
                    </p>
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center gap-x-3">
                        <input
                          id="cash"
                          name="payments"
                          onChange={handlePayment}
                          value="cash"
                          type="radio"
                          checked={paymentMethod === "cash"}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="cash"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Cash
                        </label>
                      </div>
                      <div className="flex items-center gap-x-3">
                        <input
                          id="card"
                          onChange={handlePayment}
                          name="payments"
                          checked={paymentMethod === "card"}
                          value="card"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label
                          htmlFor="card"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Card Payment
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="mx-auto mt-12 bg-white max-w-7xl px-2 sm:px-2 lg:px-4">
                <div className="border-t border-gray-200 px-0 py-6 sm:px-0">
                  <h1 className="text-4xl my-5 font-bold tracking-tight text-gray-900">
                    Cart
                  </h1>
                  <div className="flow-root">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.id} className="flex py-6">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={item.product.thumbnail}
                              alt={item.product.title}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>

                          <div className="ml-4 flex flex-1 flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>
                                  <a href={item.product.id}>
                                    {item.product.title}
                                  </a>
                                </h3>
                                <p className="ml-4">
                                &#8377;
                                {item.product.discountPrice}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.product.brand}
                              </p>
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                              <div className="text-gray-500">
                                <label
                                  htmlFor="quantity"
                                  className="inline mr-5 text-sm font-medium leading-6 text-gray-900"
                                >
                                  Qty
                                </label>
                                <select
                                  onChange={(e) => handleQuantity(e, item)}
                                  value={item.quantity}
                                >
                                  <option value="1">1</option>
                                  <option value="2">2</option>
                                  <option value="3">3</option>
                                  <option value="4">4</option>
                                  <option value="5">5</option>
                                </select>
                              </div>

                              <div className="flex">
                                <button
                                  onClick={(e) => handleRemove(e, item.id)}
                                  type="button"
                                  className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-2 py-6 sm:px-2">
                  <div className="flex justify-between my-2 text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>&#8377;
                    {totalAmount}</p>
                  </div>
                  <div className="flex justify-between my-2 text-base font-medium text-gray-900">
                    <p>Total Items in Cart</p>
                    <p>{totalItems} items</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <div
                      onClick={handleOrder}
                      className="flex cursor-pointer items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                      Order Now
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or
                      <Link to="/">
                        <button
                          type="button"
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;
