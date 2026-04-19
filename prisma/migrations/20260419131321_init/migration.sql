-- CreateTable
CREATE TABLE "ConfirmEmailToken" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "ConfirmEmailToken_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PasswordRecoveryToken" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "PasswordRecoveryToken_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmEmailToken_token_key" ON "ConfirmEmailToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordRecoveryToken_token_key" ON "PasswordRecoveryToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ConfirmEmailToken" ADD CONSTRAINT "ConfirmEmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordRecoveryToken" ADD CONSTRAINT "PasswordRecoveryToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
