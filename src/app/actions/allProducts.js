"use server";

import { prisma } from "../lib/prisma";

export async function allProducts(category = "all") {
    try {

        const products = await prisma.product.findMany({

            where: {

                published: true,

                ...(category !== "all" && {
                    category,
                }),
            },

            select: {

                id: true,
                slug: true,
                name: true,
                price: true,
                images: true,
                colors: true,
                category: true,
                featured: true,

            },

            orderBy: {
                createdAt: "desc",
            },

        });

        return products;

    } catch (error) {

        console.error(error);

        return [];
    }
}