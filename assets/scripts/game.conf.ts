const baseConfig = {
    name: "tank_green_1",
    speed: 50,
    life: 1,
    attack: true,
    shootGap: 2.5,
    bounds: 225,
};

export type Tank = typeof baseConfig

export const TankConfig: Tank[] = [
    {...baseConfig, life: 3, shootGap: 1, bounds: 654 },
    { ...baseConfig, name: "tank_red_1" },
    { ...baseConfig, name: "tank_red_2", speed: 90, shootGap: 1, bounds: 654 },
    { ...baseConfig, name: "tank_red_3" },
    { ...baseConfig, name: "tank_red_4", life: 3 , bounds: 539},
    { ...baseConfig, name: "tank_white_1" },
    { ...baseConfig, name: "tank_white_2", speed: 90, shootGap: 1, bounds: 654 },
    { ...baseConfig, name: "tank_white_3", life: 3 , bounds: 539 },
    { ...baseConfig, name: "tank_yellow_1", life: 1 },
    { ...baseConfig, name: "tank_yellow_2", life: 2 },
    { ...baseConfig, name: "tank_yellow_3", life: 3 },
    { ...baseConfig, name: "tank_yellow_4", life: 4 },
    { ...baseConfig, name: "tank_yellow_5", life: 5 },
];

// 每一关的敌方坦克数
export const ENEMY_TOTAL_PER_LEVEL = 8;
// 每个玩家的命
export const PLAYER_LIFE_TOTAL = 8;
// 总关数
export const TOTAL_LEVELS = 36;
// 奖励命的分数间隔
export const LIFE_AWARD_GAP = 1000;
