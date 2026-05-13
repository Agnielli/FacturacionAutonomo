import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y password requeridos' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: { gte: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Token inválido o caducado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    })

    return NextResponse.json({ message: 'Contraseña actualizada' })
  } catch (error) {
    console.error('Error in reset:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
