import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

const NP_API = 'https://api.novaposhta.ua/v2.0/json/';

@Injectable()
export class NovaPoshtaService {
  constructor(private prisma: PrismaService) {}

  private async getApiKey(): Promise<string> {
    const setting = await this.prisma.setting.findUnique({ where: { key: 'nova_poshta_api_key' } });
    return setting?.value || process.env.NOVA_POSHTA_API_KEY || '';
  }

  async getCities(search: string) {
    if (!search || search.length < 2) return [];
    const apiKey = await this.getApiKey();

    try {
      const res = await axios.post(NP_API, {
        apiKey,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: search,
          Limit: 10,
          Page: 1,
        },
      });

      const addresses = res.data?.data?.[0]?.Addresses ?? [];
      return addresses.map((a: any) => ({
        ref: a.DeliveryCity,
        name: a.Present,
        mainDescription: a.MainDescription,
        area: a.Area,
        settlementTypeCode: a.SettlementTypeCode,
      }));
    } catch {
      return [];
    }
  }

  async getBranches(cityRef: string, search?: string) {
    if (!cityRef) return [];
    const apiKey = await this.getApiKey();

    try {
      const res = await axios.post(NP_API, {
        apiKey,
        modelName: 'AddressGeneral',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
          FindByString: search || '',
          Limit: 50,
          Page: 1,
          Language: 'UA',
        },
      });

      const warehouses = res.data?.data ?? [];
      return warehouses.map((w: any) => ({
        ref: w.Ref,
        name: w.Description,
        shortAddress: w.ShortAddress,
        number: w.Number,
        maxWeightAllowed: w.MaxWeightAllowed,
      }));
    } catch {
      return [];
    }
  }
}
