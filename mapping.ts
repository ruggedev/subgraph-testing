import { Address, ethereum } from '@graphprotocol/graph-ts'
import { Test } from './generated/schema'
import { ERC20 } from './generated/BSCValidatorSet/ERC20'
import { ERC20NameBytes } from './generated/BSCValidatorSet/ERC20NameBytes'

const BNB_TESTNET_LIST = [
  '0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe', // Mock CAKE
]

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function handleBlock(block: ethereum.Block): void {
  let test = Test.load('1')
  // if (test != null) continue
  let erc20Contract = ERC20.bind(Address.fromString(BNB_TESTNET_LIST[0]))
  let erc20NameBytes = ERC20NameBytes.bind(Address.fromString(BNB_TESTNET_LIST[0]))
  if (test === null) {
    test = new Test('1')
  }

  test.msg1 = !erc20Contract.try_name().reverted ? erc20Contract.try_name().value : 'erc20Contract'
  test.msg2 = !erc20NameBytes.try_name().reverted ? erc20NameBytes.try_name().value.toHexString() : 'erc20NameBytes'
  test.save()
}
