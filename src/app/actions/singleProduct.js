"use server";

import { prisma } from "../lib/prisma";
import { notFound } from "next/navigation";

export async function singleProduct(slug) {

    try {

        const product = await prisma.product.findUnique({

            where: {
                slug,
            },

            select: {

                id: true,
                slug: true,
                name: true,
                description: true,
                price: true,
                images: true,
                colors: true,
                sizes: true,
                category: true,

            },

        });

        if (!product) {
            notFound();
        }

        return product;

    } catch (error) {

        console.error(error);

        notFound();

    }

}