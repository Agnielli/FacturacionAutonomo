import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Por seguridad, no decimos si el email existe o no
      return NextResponse.json({ message: 'Proceso iniciado' })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hora

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetExpires: expires,
      },
    })

    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ message: 'Proceso iniciado' })
  } catch (error) {
    console.error('Error in recovery:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
