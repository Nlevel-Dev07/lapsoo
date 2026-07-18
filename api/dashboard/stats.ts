import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return
  const session = requireAdmin(req, res)
  if (!session) return

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    productCount,
    publishedProductCount,
    brandCount,
    blogCount,
    enquiryCount,
    corporateLeadCount,
    repairRequestCount,
    sellExchangeCount,
    newEnquiries30d,
    newCorporate30d,
    newRepairs30d,
    newSellExchange30d,
    enquiriesBySource,
    repairsByStatus,
    customerCount,
    newCustomers30d,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.brand.count(),
    prisma.blogPost.count(),
    prisma.enquiry.count(),
    prisma.corporateLead.count(),
    prisma.repairRequest.count(),
    prisma.sellExchangeLead.count(),
    prisma.enquiry.count({ where: { createdAt: { gte: since30 } } }),
    prisma.corporateLead.count({ where: { createdAt: { gte: since30 } } }),
    prisma.repairRequest.count({ where: { createdAt: { gte: since30 } } }),
    prisma.sellExchangeLead.count({ where: { createdAt: { gte: since30 } } }),
    prisma.enquiry.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.repairRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.customer.count(),
    prisma.customer.count({ where: { createdAt: { gte: since30 } } }),
  ])

  const totalLeads30d = newEnquiries30d + newCorporate30d + newRepairs30d + newSellExchange30d

  res.status(200).json({
    catalog: { productCount, publishedProductCount, brandCount, blogCount },
    leads: {
      total: enquiryCount + corporateLeadCount + repairRequestCount + sellExchangeCount,
      enquiries: enquiryCount,
      corporateLeads: corporateLeadCount,
      repairRequests: repairRequestCount,
      sellExchangeLeads: sellExchangeCount,
      last30Days: totalLeads30d,
    },
    customers: { total: customerCount, last30Days: newCustomers30d },
    enquiriesBySource: enquiriesBySource.map((e) => ({ source: e.source, count: e._count._all })),
    repairsByStatus: repairsByStatus.map((r) => ({ status: r.status, count: r._count._all })),
  })
})
