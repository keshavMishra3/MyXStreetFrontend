import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersAsync,
  selectOrders,
  selectTotalOrders,
  updateOrderAsync,
} from "../../order/orderSlice";
import { selectUserInfo } from "../../user/userSlice";
import Pagination from "../../common/Pagination";
import { ITEMS_PER_PAGE } from "../../../app/constants";

function AdminOrders() {
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const totalOrders = useSelector(selectTotalOrders);
  const [editableProductId, setEditableProductId] = useState(null);
  const user = useSelector(selectUserInfo);
  console.log("User Info:", user);
  const handleOrderStatus = (e, order) => {
    const updatedOrder = {
      orderId: order.orderId,
      productId: order.productId,
      status: e.target.value,
    };
    dispatch(updateOrderAsync(updatedOrder));
    setEditableProductId(null);
  };

  const handlePage = (page) => {
    setPage(page);
  };

  const chooseColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-purple-200 text-purple-600";
      case "dispatched":
        return "bg-yellow-200 text-yellow-600";
      case "delivered":
        return "bg-green-200 text-green-600";
      case "cancelled":
        return "bg-red-200 text-red-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  useEffect(() => {
    const query = {
      _page: page,
      _limit: ITEMS_PER_PAGE,
    };
    dispatch(fetchAllOrdersAsync({ query }));
  }, [dispatch, page]);

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-100 flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full">
          <div className="bg-white shadow-md rounded my-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  {/* Removed Order ID */}
                  <th className="py-3 px-3 text-left">Product ID</th>
                  <th className="py-3 px-3 text-left">Title</th>
                  <th className="py-3 px-3 text-center">Quantity</th>
                  <th className="py-3 px-3 text-center">Shipping Address</th>
                  <th className="py-3 px-3 text-center">Order Status</th>
                  <th className="py-3 px-3 text-center">Payment Method</th>
                  <th className="py-3 px-3 text-center">Ordered By</th>
                  <th className="py-3 px-3 text-left">Ordered At</th>
                  <th className="py-3 px-3 text-left">Updated At</th>
                </tr>
              </thead>

              <tbody className="text-gray-600 text-sm font-light">
                {orders.map((order) =>
                  order.items
                    .filter((item) => item.product.owner === user.id) // ✅ Show only items owned by this seller
                    .map((item, index) => (
                      <tr
                        key={`${order._id}-${item.product.id}-${index}`}
                        className="border-b border-gray-200 hover:bg-gray-100"
                      >
                        <td className="py-3 px-3 text-left">
                          {item.product.id}
                        </td>
                        <td className="py-3 px-3 text-left">
                          {item.product.title}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-left">
                          <strong>{order.selectedAddress?.name}</strong>,<br />
                          {order.selectedAddress?.street},{" "}
                          {order.selectedAddress?.city},<br />
                          {order.selectedAddress?.state} -{" "}
                          {order.selectedAddress?.pinCode}
                          <br />
                          Ph: {order.selectedAddress?.phone}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {editableProductId === item.product.id ? (
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleOrderStatus(e, {
                                  orderId: order._id,
                                  productId: item.product.id,
                                })
                              }
                              className="border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span
                              className={`${chooseColor(
                                order.status
                              )} py-1 px-3 rounded-full text-xs cursor-pointer`}
                              onClick={() =>
                                setEditableProductId(item.product.id)
                              }
                            >
                              {order.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {order.paymentMethod}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {order.user?.email || "N/A"}
                        </td>
                        <td className="py-3 px-3 text-left">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-left">
                          {new Date(order.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            setPage={setPage}
            handlePage={handlePage}
            totalItems={totalOrders}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
